import { ethers } from 'ethers';
import { RemoveLiquidityActions } from '../../lib/protocol/liquidity/types';
import { IPool } from '../../lib/protocol/types';
import { cleanValue } from '../../utils/appUtils';
import { calcPoolRatios } from '../../utils/yieldMath';
import useConnector from '../useConnector';
import useSignature from '../useSignature';
import useLadle from './useLadle';
import useTransaction from '../useTransaction';

export const useRemoveLiquidity = (pool: IPool, input: string, method: RemoveLiquidityActions, description: string) => {
  const { account } = useConnector();
  const { sign } = useSignature();
  const { handleTransact, isTransacting, txSubmitted } = useTransaction();
  const { ladleContract, batch, transferAction, burnForBaseAction, burnAction, exitETHAction } = useLadle();

  const removeLiquidity = async () => {
    if (!pool) throw new Error('no pool'); // prohibit trade if there is no pool

    const { base } = pool;
    const cleanInput = cleanValue(input, base.decimals);
    const _input = ethers.utils.parseUnits(cleanInput, base.decimals);

    const [cachedBaseReserves, cachedFyTokenReserves] = await pool.contract.getCache();
    const cachedRealReserves = cachedFyTokenReserves.sub(pool.totalSupply);

    const [minRatio, maxRatio] = calcPoolRatios(cachedBaseReserves, cachedRealReserves);

    const alreadyApproved = (await pool.contract.allowance(account!, ladleContract?.address!)).gte(_input);

    const overrides = {
      gasLimit: 250000,
    };

    const isETH = pool.base.symbol === 'ETH';

    const _burnForBase = async () => {
      const permits = await sign([
        {
          target: pool,
          spender: ladleContract?.address!,
          amount: _input,
          ignoreIf: alreadyApproved,
        },
      ]);

      return batch(
        [
          ...permits,
          { action: transferAction(pool.address, pool.address, _input)! },
          { action: burnForBaseAction(pool.contract, isETH ? ladleContract?.address! : account!, minRatio, maxRatio)! },
          { action: exitETHAction(account!)!, ignoreIf: !isETH },
        ],
        overrides
      );
    };

    const _burn = async () => {
      const permits = await sign([
        {
          target: pool,
          spender: ladleContract?.address!,
          amount: _input,
          ignoreIf: alreadyApproved,
        },
      ]);

      return batch(
        [
          ...permits,
          { action: transferAction(pool.address, pool.address, _input)! },
          {
            action: burnAction(
              pool.contract,
              isETH ? ladleContract?.address! : account!,
              account!,
              minRatio,
              maxRatio
            )!,
          },
          { action: exitETHAction(account!)!, ignoreIf: !isETH },
        ],
        overrides
      );
    };

    handleTransact(method === RemoveLiquidityActions.BURN_FOR_BASE ? _burnForBase : _burn, description);
  };

  return { removeLiquidity, isRemovingLiq: isTransacting, removeSubmitted: txSubmitted };
};
