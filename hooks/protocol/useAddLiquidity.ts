import { ethers, PayableOverrides } from 'ethers';
import { cleanValue } from '../../utils/appUtils';
import { calcPoolRatios, fyTokenForMint } from '../../utils/yieldMath';
import { IPool } from '../../lib/protocol/types';
import useConnector from '../useConnector';
import { AddLiquidityActions } from '../../lib/protocol/liquidity/types';
import useSignature from '../useSignature';
import useLadle from './useLadle';
import useTransaction from '../useTransaction';
import useAddLiqPreview from './useAddLiqPreview';
import { useLocalStorage } from '../useLocalStorage';
import { DEFAULT_SLIPPAGE, SLIPPAGE_KEY } from '../../constants';

export const useAddLiquidity = (pool: IPool | undefined, input: string, method: AddLiquidityActions) => {
  const { account } = useConnector();
  const { sign } = useSignature();
  const { handleTransact, isTransacting, txSubmitted } = useTransaction();
  const { ladleContract, batch, transferAction, mintWithBaseAction, mintAction, wrapETHAction, exitETHAction } =
    useLadle();
  const { fyTokenNeeded, fyTokenNeeded_ } = useAddLiqPreview(pool!, input, method);

  // settings
  const [slippageTolerance] = useLocalStorage(SLIPPAGE_KEY, DEFAULT_SLIPPAGE);

  // description to use in toast
  const description = `Add ${input} ${pool?.base.symbol}${
    fyTokenNeeded.gt(ethers.constants.Zero) && method === AddLiquidityActions.MINT
      ? ` and ${fyTokenNeeded_} ${pool?.fyToken.symbol}`
      : ''
  } as liquidity`;

  const addLiquidity = async () => {
    if (!pool) throw new Error('no pool'); // prohibit trade if there is no pool

    // pool data
    const {
      address: poolAddress,
      contract: poolContract,
      base,
      fyToken,
      ts,
      g1,
      decimals,
      getTimeTillMaturity,
      totalSupply,
    } = pool;
    const timeTillMaturity = getTimeTillMaturity().toString();
    const [cachedBaseReserves, cachedFyTokenReserves] = await poolContract.getCache();
    const cachedRealReserves = cachedFyTokenReserves.sub(totalSupply);
    const [minRatio, maxRatio] = calcPoolRatios(cachedBaseReserves, cachedRealReserves);

    // input data
    const cleanInput = cleanValue(input, base.decimals);
    const _input = ethers.utils.parseUnits(cleanInput, base.decimals);

    // check if signature is still required
    const alreadyApprovedBase = (await base.getAllowance(account!, ladleContract?.address!)).gte(_input);
    const alreadyApprovedFyToken = (await fyToken.getAllowance(account!, ladleContract?.address!)).gte(fyTokenNeeded);

    const overrides = {
      gasLimit: 250000,
    };
    const isEth = base.symbol === 'ETH';
    const withEthOverrides = { ...overrides, value: isEth ? _input : undefined } as PayableOverrides;

    const _mintWithBase = async () => {
      const [_fyTokenToBeMinted] = fyTokenForMint(
        cachedBaseReserves,
        cachedRealReserves,
        cachedFyTokenReserves,
        _input,
        timeTillMaturity,
        ts,
        g1,
        decimals,
        +slippageTolerance
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
          { action: wrapETHAction(poolContract, _input)!, ignoreIf: !isEth },
          { action: transferAction(base.address, poolAddress, _input)!, ignoreIf: isEth },
          {
            action: mintWithBaseAction(
              poolContract,
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

    const _mint = async () => {
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
          amount: fyTokenNeeded,
          ignoreIf: alreadyApprovedFyToken,
        },
      ]);

      return batch(
        [
          ...permits,
          { action: wrapETHAction(poolContract, _input)!, ignoreIf: !isEth },
          { action: transferAction(base.address, poolAddress, _input)!, ignoreIf: isEth },
          { action: transferAction(fyToken.address, poolAddress, fyTokenNeeded)! },
          {
            action: mintAction(
              poolContract,
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
