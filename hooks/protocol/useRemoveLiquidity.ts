import { ethers } from 'ethers';
import { RemoveLiquidityActions } from '../../lib/protocol/liquidity/types';
import { IPool } from '../../lib/protocol/types';
import { cleanValue } from '../../utils/appUtils';
import { calcPoolRatios } from '../../utils/yieldMath';
import useConnector from '../useConnector';
import useSignature from '../useSignature';
import useLadle from './useLadle';
import useTransaction from '../useTransaction';
import { LadleActions } from '../../lib/tx/operations';

export const useRemoveLiquidity = (pool: IPool, input: string, method: RemoveLiquidityActions, description: string) => {
  const { account } = useConnector();
  const { sign } = useSignature();
  const { transact, handleTransact, isTransacting, txSubmitted } = useTransaction();
  const { ladleContract, forwardPermitAction, batch, transferAction, burnForBaseAction, burnAction } = useLadle();

  const removeLiquidity = async () => {
    if (!pool) throw new Error('no pool'); // prohibit trade if there is no pool

    const { base } = pool;
    const cleanInput = cleanValue(input, base.decimals);
    const _input = ethers.utils.parseUnits(cleanInput, base.decimals);

    const [cachedBaseReserves, cachedFyTokenReserves] = await pool.contract.getCache();
    const cachedRealReserves = cachedFyTokenReserves.sub(pool.totalSupply);

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

      const [, , , deadline, v, r, s] = permits[0].args! as LadleActions.Args.FORWARD_PERMIT;

      return batch(
        [
          forwardPermitAction(pool.address, ladleContract?.address!, _input, deadline, v, r, s)!,
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

      const [, , , deadline, v, r, s] = permits[0].args! as LadleActions.Args.FORWARD_PERMIT;

      return batch(
        [
          forwardPermitAction(pool.address, ladleContract?.address!, _input, deadline, v, r, s)!,
          transferAction(pool.address, pool.address, _input)!,
          burnAction(pool.contract, account!, account!, minRatio, maxRatio)!,
        ],
        overrides
      );
    };

    handleTransact(method === RemoveLiquidityActions.BURN_FOR_BASE ? _burnForBase : _burn, description);
  };

  return { removeLiquidity, isRemovingLiq: isTransacting, removeSubmitted: txSubmitted };
};
