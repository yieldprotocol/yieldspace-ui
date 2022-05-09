import { ethers } from 'ethers';
import { RemoveLiquidityActions } from '../../lib/protocol/liquidity/types';
import { IPool } from '../../lib/protocol/types';
import { cleanValue } from '../../utils/appUtils';
import { calcPoolRatios } from '../../utils/yieldMath';
import useSignature from '../useSignature';
import useLadle from './useLadle';
import useTransaction from '../useTransaction';
import { useAccount } from 'wagmi';

export const useRemoveLiquidity = (pool: IPool, input: string, method: RemoveLiquidityActions, description: string) => {
  const { data: account } = useAccount();
  const { sign } = useSignature();
  const { handleTransact, isTransacting, txSubmitted } = useTransaction();
  const { ladleContract, batch, transferAction, burnForBaseAction, burnAction, exitETHAction, redeemFYToken } =
    useLadle();

  const removeLiquidity = async () => {
    if (!pool) throw new Error('no pool'); // prohibit trade if there is no pool

    const { base, address: poolAddress, contract: poolContract, isMature, seriesId, fyToken } = pool;
    const cleanInput = cleanValue(input, base.decimals);
    const _input = ethers.utils.parseUnits(cleanInput, base.decimals);

    const [cachedBaseReserves, cachedFyTokenReserves] = await pool.contract.getCache();
    const cachedRealReserves = cachedFyTokenReserves.sub(pool.totalSupply);

    const [minRatio, maxRatio] = calcPoolRatios(cachedBaseReserves, cachedRealReserves);

    const alreadyApproved = (await pool.contract.allowance(account?.address!, ladleContract?.address!)).gte(_input);

    const overrides = {
      gasLimit: 300000,
    };

    const isETH = base.symbol === 'ETH';
    const toAddress = isETH ? ladleContract?.address! : account?.address!;

    const _remove = async () => {
      const permits = await sign([
        {
          target: pool,
          spender: ladleContract?.address!,
          amount: _input,
          ignoreIf: alreadyApproved,
        },
      ]);

      // handles both burnForBase and burn actions, before and after maturity
      return batch(
        [
          ...permits,
          { action: transferAction(poolAddress, poolAddress, _input)! },
          {
            action: burnForBaseAction(poolContract, toAddress, minRatio, maxRatio)!,
            ignoreIf: method !== RemoveLiquidityActions.BURN_FOR_BASE || isMature,
          },
          {
            action: burnAction(
              poolContract,
              toAddress,
              isMature ? fyToken.address : account?.address!, // after maturity, use the fyToken address as the destination to redeem
              minRatio,
              maxRatio
            )!,
            ignoreIf: method === RemoveLiquidityActions.BURN_FOR_BASE && !isMature,
          },
          {
            action: redeemFYToken(seriesId, toAddress, '0')!,
            ignoreIf: !isMature,
          },
          { action: exitETHAction(account?.address!)!, ignoreIf: !isETH },
        ],
        overrides
      );
    };

    handleTransact(_remove, description);
  };

  return { removeLiquidity, isRemovingLiq: isTransacting, removeSubmitted: txSubmitted };
};
