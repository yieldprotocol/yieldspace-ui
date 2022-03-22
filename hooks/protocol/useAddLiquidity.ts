import { BigNumber, ethers } from 'ethers';
import { cleanValue } from '../../utils/appUtils';
import { calcPoolRatios, calculateSlippage, fyTokenForMint, splitLiquidity } from '../../utils/yieldMath';
import { IPool } from '../../lib/protocol/types';
import useConnector from '../useConnector';
import { AddLiquidityActions } from '../../lib/protocol/liquidity/types';
import useSignature from '../useSignature';
import useLadle from './useLadle';
import { LadleActions } from '../../lib/tx/operations';
import { DAI_PERMIT_ASSETS } from '../../config/assets';
import useTransaction from '../useTransaction';

export const useAddLiquidity = (pool: IPool, input: string, method: AddLiquidityActions, description: string) => {
  const { account } = useConnector();
  const { sign } = useSignature();
  const { transact, isTransacting, txSubmitted } = useTransaction();
  const {
    ladleContract,
    forwardDaiPermitAction,
    forwardPermitAction,
    batch,
    transferAction,
    mintWithBaseAction,
    mintAction,
  } = useLadle();

  // settings
  const slippageTolerance = 0.001;

  const addLiquidity = async () => {
    if (!pool) throw new Error('no pool'); // prohibit trade if there is no pool

    const { base, fyToken } = pool;
    const cleanInput = cleanValue(input, base.decimals);
    const _input = ethers.utils.parseUnits(cleanInput, base.decimals);
    const _inputLessSlippage = _input;

    // const _inputLessSlippage = calculateSlippage(_input, slippageTolerance.toString(), true);

    const [cachedBaseReserves, cachedFyTokenReserves] = await pool.contract.getCache();
    const cachedRealReserves = cachedFyTokenReserves.sub(pool.totalSupply);

    const [_fyTokenToBeMinted] = fyTokenForMint(
      cachedBaseReserves,
      cachedRealReserves,
      cachedFyTokenReserves,
      _inputLessSlippage,
      pool.getTimeTillMaturity().toString(),
      pool.ts,
      pool.g1,
      pool.decimals,
      slippageTolerance
    );

    const [minRatio, maxRatio] = calcPoolRatios(cachedBaseReserves, cachedRealReserves);

    const [_baseToPool, _baseToFyToken] = splitLiquidity(
      cachedBaseReserves,
      cachedRealReserves,
      _inputLessSlippage,
      true
    ) as [BigNumber, BigNumber];

    const _baseToPoolWithSlippage = BigNumber.from(calculateSlippage(_baseToPool, slippageTolerance.toString()));

    /* if approveMax, check if signature is still required */
    const alreadyApproved = (await base.getAllowance(account!, pool.address)).gt(_input);

    const overrides = {
      gasLimit: 250000,
    };

    const _mintWithBase = async (): Promise<ethers.ContractTransaction | undefined> => {
      const permits = await sign([
        {
          target: pool.base,
          spender: ladleContract?.address!,
          amount: _input,
          ignoreIf: alreadyApproved,
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

      const [token, spender, amount, deadline, v, r, s] = permits[0].args! as LadleActions.Args.FORWARD_PERMIT;

      return batch(
        [
          forwardPermitAction(token, spender, amount, deadline, v, r, s)!,
          transferAction(base.address, pool.address, _input)!,
          mintWithBaseAction(pool.contract, account!, account!, _fyTokenToBeMinted, minRatio, maxRatio)!,
        ],
        overrides
      );
    };

    const _mint = async (): Promise<ethers.ContractTransaction | undefined> => {
      const permits = await sign([
        {
          target: pool.base,
          spender: ladleContract?.address!,
          amount: _input,
          ignoreIf: alreadyApproved,
        },
        {
          target: pool.fyToken,
          spender: ladleContract?.address!,
          amount: _input,
          ignoreIf: alreadyApproved,
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

    transact(method === AddLiquidityActions.MINT_WITH_BASE ? _mintWithBase : _mint, description);
  };

  return { addLiquidity, isAddingLiquidity: isTransacting, addSubmitted: txSubmitted };
};
