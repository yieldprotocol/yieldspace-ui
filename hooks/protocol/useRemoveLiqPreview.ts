import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { RemoveLiquidityActions } from '../../lib/protocol/liquidity/types';
import { IPool } from '../../lib/protocol/types';
import { burn, burnForBase, newPoolState, sellFYToken } from '../../utils/yieldMath';

const useRemoveLiqPreview = (pool: IPool | undefined, lpTokens: string, method: RemoveLiquidityActions) => {
  const [baseReceived, setBaseReceived] = useState<string>();
  const [fyTokenReceived, setFyTokenReceived] = useState<string>();
  const [canReceiveAllBase, setCanReceiveAllBase] = useState<boolean>(true);

  useEffect(() => {
    const getPrevewData = async () => {
      if (!pool) {
        setFyTokenReceived('');
        return setBaseReceived('');
      }

      const { totalSupply, decimals, contract, getTimeTillMaturity, ts, g2 } = pool;
      const timeTillMaturity = getTimeTillMaturity().toString();

      const _lpTokens = ethers.utils.parseUnits(lpTokens || '0', decimals);

      const [cachedBaseReserves, cachedFyTokenReserves] = await contract.getCache();
      const cachedRealReserves = cachedFyTokenReserves.sub(totalSupply);

      const [_baseReceived, _fyTokenReceived] = burn(cachedBaseReserves, cachedRealReserves, totalSupply, _lpTokens);

      const newPool = newPoolState(
        _baseReceived.mul(-1),
        _fyTokenReceived.mul(-1),
        cachedBaseReserves,
        cachedRealReserves,
        totalSupply
      );

      const fyTokenTrade = sellFYToken(
        newPool.baseReserves,
        newPool.fyTokenVirtualReserves,
        _fyTokenReceived,
        timeTillMaturity,
        ts,
        g2,
        decimals
      );

      setCanReceiveAllBase(fyTokenTrade.gt(ethers.constants.Zero)); // check if the user can receive all base, otherwise, default to burn

      if (method === RemoveLiquidityActions.BURN_FOR_BASE) {
        const baseTokenReceived = burnForBase(
          cachedBaseReserves,
          cachedFyTokenReserves,
          cachedRealReserves,
          _lpTokens,
          getTimeTillMaturity().toString(),
          ts,
          g2,
          decimals
        );

        setFyTokenReceived(undefined);
        return setBaseReceived(ethers.utils.formatUnits(baseTokenReceived, decimals));
      } else {
        setBaseReceived(ethers.utils.formatUnits(_baseReceived, decimals));
        setFyTokenReceived(ethers.utils.formatUnits(_fyTokenReceived, decimals));
      }
    };

    getPrevewData();
  }, [lpTokens, method, pool]);

  return { baseReceived, fyTokenReceived, canReceiveAllBase };
};

export default useRemoveLiqPreview;
