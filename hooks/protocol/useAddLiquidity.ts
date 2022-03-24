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
    const alreadyApprovedBase = (await base.getAllowance(account!, pool.address)).gt(_input);
    const alreadyApprovedFyToken = (await fyToken.getAllowance(account!, pool.address)).gt(_fyTokenNeeded);

    const overrides = {
      gasLimit: 250000,
    };

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
          target: pool.base,
          spender: ladleContract?.address!,
          amount: _input,
          ignoreIf: alreadyApprovedBase,
        },
      ]);

      if (DAI_PERMIT_ASSETS.includes(pool.base.symbol)) {
        const [address, spender, nonce, deadline, allowed, v, r, s] = permits[0]
          .args as LadleActions.Args.FORWARD_DAI_PERMIT;

        return batch(
          [
            forwardDaiPermitAction(address, spender, nonce, deadline, allowed, v, r, s)!,
            transferAction(base.address, pool.address, _input)!,
            mintWithBaseAction(pool.contract, account!, account!, _fyTokenToBeMinted, minRatio, maxRatio)!,
          ],
          overrides
        );
      }

      // build action array
      const isEthPool = pool.base.symbol === 'ETH';
      const withEthOverrides = { ...overrides, value: _input } as PayableOverrides;

      const actions = [
        isEthPool && wrapETHAction(pool.contract, _input)!,
        !isEthPool && forwardPermitAction(...(permits[0].args as LadleActions.Args.FORWARD_PERMIT))!,
        !isEthPool && transferAction(base.address, pool.address, _input)!,
        mintWithBaseAction(
          pool.contract,
          account!,
          isEthPool ? ladleContract?.address! : account!, // minting with eth needs to be sent to ladle
          _fyTokenToBeMinted,
          minRatio,
          maxRatio
        )!,
        isEthPool && exitETHAction(account!),
      ].filter(Boolean) as string[];

      return batch(actions, withEthOverrides);
    };

    const _mint = async (): Promise<ethers.ContractTransaction | undefined> => {
      const permits = await sign([
        {
          target: pool.base,
          spender: ladleContract?.address!,
          amount: _input,
          ignoreIf: alreadyApprovedBase,
        },
        {
          target: pool.fyToken,
          spender: ladleContract?.address!,
          amount: _fyTokenNeeded,
          ignoreIf: alreadyApprovedFyToken,
        },
      ]);

      const [fyAddress, fySpender, fyAmount, fyDeadline, fyV, fyR, fyS] = permits[1]
        .args! as LadleActions.Args.FORWARD_PERMIT;

      if (DAI_PERMIT_ASSETS.includes(pool.base.symbol)) {
        const [baseAddress, baseSpender, baseNonce, baseDeadline, baseAllowed, baseV, baseR, baseS] = permits[0]
          .args! as LadleActions.Args.FORWARD_DAI_PERMIT;

        return batch(
          [
            forwardDaiPermitAction(
              baseAddress,
              baseSpender,
              baseNonce,
              baseDeadline,
              baseAllowed,
              baseV,
              baseR,
              baseS
            )!,
            forwardPermitAction(fyAddress, fySpender, fyAmount, fyDeadline, fyV, fyR, fyS)!,
            transferAction(baseAddress, pool.address, _input)!,
            transferAction(fyAddress, pool.address, fyAmount)!,
            mintAction(pool.contract, account!, account!, minRatio, maxRatio)!,
          ],
          overrides
        );
      }

      const [baseAddress, baseSpender, baseAmount, baseDeadline, baseV, baseR, baseS] = permits[0]
        .args! as LadleActions.Args.FORWARD_PERMIT;

      return batch(
        [
          forwardPermitAction(baseAddress, baseSpender, baseAmount, baseDeadline, baseV, baseR, baseS)!,
          forwardPermitAction(fyAddress, fySpender, fyAmount, fyDeadline, fyV, fyR, fyS)!,
          transferAction(baseAddress, pool.address, baseAmount)!,
          transferAction(fyAddress, pool.address, fyAmount)!,
          mintAction(pool.contract, account!, account!, minRatio, maxRatio)!,
        ],
        overrides
      );
    };

    handleTransact(method === AddLiquidityActions.MINT_WITH_BASE ? _mintWithBase : _mint, description);
  };

  return { addLiquidity, isAddingLiquidity: isTransacting, addSubmitted: txSubmitted };
};
