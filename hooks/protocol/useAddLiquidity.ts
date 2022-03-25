import { ethers, PayableOverrides } from 'ethers';
import { cleanValue } from '../../utils/appUtils';
import { calcPoolRatios, fyTokenForMint } from '../../utils/yieldMath';
import { IPool } from '../../lib/protocol/types';
import useConnector from '../useConnector';
import { AddLiquidityActions } from '../../lib/protocol/liquidity/types';
import useSignature from '../useSignature';
import useLadle from './useLadle';
import { LadleActions } from '../../lib/tx/operations';
import { DAI_PERMIT_ASSETS } from '../../config/assets';
import useTransaction from '../useTransaction';
import useAddLiqPreview from './useAddLiqPreview';

export const useAddLiquidity = (
  pool: IPool,
  input: string,
  method: AddLiquidityActions,
  description: string,
  slippageTolerance = 0.001
) => {
  const { account } = useConnector();
  const { sign } = useSignature();
  const { handleTransact, isTransacting, txSubmitted } = useTransaction();
  const {
    ladleContract,
    forwardDaiPermitAction,
    forwardPermitAction,
    batch,
    transferAction,
    mintWithBaseAction,
    mintAction,
    wrapETHAction,
    exitETHAction,
  } = useLadle();

  const { fyTokenNeeded } = useAddLiqPreview(pool, input, method, slippageTolerance);

  const addLiquidity = async () => {
    if (!pool) throw new Error('no pool'); // prohibit trade if there is no pool

    const { base, fyToken } = pool;
    const cleanInput = cleanValue(input, base.decimals);
    const _input = ethers.utils.parseUnits(cleanInput, base.decimals);
    const _fyTokenNeeded = ethers.utils.parseUnits(fyTokenNeeded!, fyToken.decimals);

    const [cachedBaseReserves, cachedFyTokenReserves] = await pool.contract.getCache();
    const cachedRealReserves = cachedFyTokenReserves.sub(pool.totalSupply);
    const [minRatio, maxRatio] = calcPoolRatios(cachedBaseReserves, cachedRealReserves);

    /* if approveMax, check if signature is still required */
    const alreadyApprovedBase = (await base.getAllowance(account!, ladleContract?.address!)).gt(_input);
    const alreadyApprovedFyToken = (await fyToken.getAllowance(account!, ladleContract?.address!)).gt(_fyTokenNeeded);

    const overrides = {
      gasLimit: 250000,
    };

    const isEth = pool.base.symbol === 'ETH';
    const withEthOverrides = { ...overrides, value: isEth ? _input : undefined } as PayableOverrides;
    const isDai = DAI_PERMIT_ASSETS.includes(base.symbol);

    const _mintWithBase = async (): Promise<ethers.ContractTransaction | undefined> => {
      const [_fyTokenToBeMinted] = fyTokenForMint(
        cachedBaseReserves,
        cachedRealReserves,
        cachedFyTokenReserves,
        _input,
        pool.getTimeTillMaturity().toString(),
        pool.ts,
        pool.g1,
        pool.decimals,
        slippageTolerance
      );

      const permits = await sign([
        {
          target: base,
          spender: ladleContract?.address!,
          amount: _input,
          ignoreIf: alreadyApprovedBase,
        },
      ]);

      return batch(
        [
          ...permits,
          { action: wrapETHAction(pool.contract, _input)!, ignoreIf: !isEth },
          { action: transferAction(base.address, pool.address, _input)!, ignoreIf: isEth },
          {
            action: mintWithBaseAction(
              pool.contract,
              account!,
              isEth ? ladleContract?.address! : account!, // minting with eth needs to be sent to ladle
              _fyTokenToBeMinted,
              minRatio,
              maxRatio
            )!,
          },
          { action: exitETHAction(account!)!, ignoreIf: !isEth }, // leftover eth gets sent back to account
        ],
        withEthOverrides
      );
    };

    const _mint = async (): Promise<ethers.ContractTransaction | undefined> => {
      const permits = await sign([
        {
          target: base,
          spender: ladleContract?.address!,
          amount: _input,
          ignoreIf: alreadyApprovedBase,
        },
        {
          target: fyToken,
          spender: ladleContract?.address!,
          amount: _fyTokenNeeded,
          ignoreIf: alreadyApprovedFyToken,
        },
      ]);

      return batch(
        [
          ...permits,
          { action: wrapETHAction(pool.contract, _input)!, ignoreIf: !isEth },
          { action: transferAction(base.address, pool.address, _input)!, ignoreIf: isEth },
          { action: transferAction(fyToken.address, pool.address, _fyTokenNeeded)! },
          {
            action: mintAction(
              pool.contract,
              isEth ? ladleContract?.address! : account!, // minting with eth needs to be sent to ladle
              account!,
              minRatio,
              maxRatio
            )!,
          },
          { action: exitETHAction(account!)!, ignoreIf: !isEth }, // leftover eth gets sent back to account
        ],
        withEthOverrides
      );
    };

    handleTransact(method === AddLiquidityActions.MINT_WITH_BASE ? _mintWithBase : _mint, description);
  };

  return { addLiquidity, isAddingLiquidity: isTransacting, addSubmitted: txSubmitted };
};
