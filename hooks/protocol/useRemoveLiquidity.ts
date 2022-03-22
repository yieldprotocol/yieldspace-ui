import { BigNumberish, ethers } from 'ethers';
import { RemoveLiquidityActions } from '../../lib/protocol/liquidity/types';
import { IPool } from '../../lib/protocol/types';
import { cleanValue } from '../../utils/appUtils';
import { burn, calcPoolRatios } from '../../utils/yieldMath';
import useConnector from '../useConnector';
import useSignature from '../useSignature';
import useLadle from './useLadle';
import useTransaction from '../useTransaction';

export const useRemoveLiquidity = (pool: IPool, input: string, method: RemoveLiquidityActions, description: string) => {
  const { account } = useConnector();
  const { sign } = useSignature();
  const { transact, isTransacting, txSubmitted } = useTransaction();
  const { ladleContract, forwardPermitAction, batch, transferAction, burnForBaseAction, burnAction } = useLadle();

  // settings
  const approveMax = false;
  const slippageTolerance = 0.001;

  const removeLiquidity = async () => {
    if (!pool) throw new Error('no pool'); // prohibit trade if there is no pool

    const { base, fyToken } = pool;
    const cleanInput = cleanValue(input, base.decimals);
    const _input = ethers.utils.parseUnits(cleanInput, base.decimals);
    const _inputLessSlippage = _input;

    const [cachedBaseReserves, cachedFyTokenReserves] = await pool.contract.getCache();
    const cachedRealReserves = cachedFyTokenReserves.sub(pool.totalSupply);

    const [_baseTokenReceived, _fyTokenReceived] = burn(
      pool.baseReserves,
      cachedRealReserves,
      pool.totalSupply,
      _inputLessSlippage
    );

    const [minRatio, maxRatio] = calcPoolRatios(cachedBaseReserves, cachedRealReserves);

    const alreadyApproved = (await pool.contract.allowance(account!, ladleContract?.address!)).gt(_input);

    const overrides = {
      gasLimit: 250000,
    };

    const _burnForBase = async (): Promise<ethers.ContractTransaction | undefined> => {
      const permits = await sign([
        {
          target: pool,
          spender: ladleContract?.address!,
          amount: _input,
          ignoreIf: alreadyApproved,
        },
      ]);
      const [, , , deadline, v, r, s] = permits[0].args!;

      return batch(
        [
          forwardPermitAction(
            pool.address,
            ladleContract?.address!,
            _input,
            deadline as BigNumberish,
            v as BigNumberish,
            r as Buffer,
            s as Buffer
          )!,
          transferAction(pool.address, pool.address, _input)!,
          burnForBaseAction(pool.contract, account!, minRatio, maxRatio)!,
        ],
        overrides
      );
    };

    const _burn = async (): Promise<ethers.ContractTransaction | undefined> => {
      const permits = await sign([
        {
          target: pool,
          spender: ladleContract?.address!,
          amount: _input,
          ignoreIf: alreadyApproved,
        },
      ]);
      const [, , , deadline, v, r, s] = permits[0].args!;

      return batch(
        [
          forwardPermitAction(
            pool.address,
            ladleContract?.address!,
            _input,
            deadline as BigNumberish,
            v as BigNumberish,
            r as Buffer,
            s as Buffer
          )!,
          transferAction(pool.address, pool.address, _input)!,
          burnAction(pool.contract, account!, account!, minRatio, maxRatio)!,
        ],
        overrides
      );
    };

    transact(method === RemoveLiquidityActions.BURN_FOR_BASE ? _burnForBase : _burn, description);
  };

  return { removeLiquidity, isRemovingLiq: isTransacting, removeSubmitted: txSubmitted };
};
