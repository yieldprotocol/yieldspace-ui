import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { RemoveLiquidityActions } from '../../lib/protocol/liquidity/types';
import { IPool } from '../../lib/protocol/types';
import { burn, burnForBase } from '../../utils/yieldMath';

const useRemoveLiqPreview = (pool: IPool, lpTokens: string, method: RemoveLiquidityActions) => {
  const [baseReceived, setBaseReceived] = useState<string>();
  const [fyTokenReceived, setFyTokenReceived] = useState<string>();

  useEffect(() => {
    const getPrevewData = async () => {
      if (!pool) {
        setFyTokenReceived('');
        return setBaseReceived('');
      }
      const { totalSupply, decimals, contract, getTimeTillMaturity, ts, g2 } = pool;

      const _lpTokens = ethers.utils.parseUnits(lpTokens, decimals);

      const [cachedBaseReserves, cachedFyTokenReserves] = await contract.getCache();
      const cachedRealReserves = cachedFyTokenReserves.sub(totalSupply);

      if (method === RemoveLiquidityActions.BURN_FOR_BASE) {
        const _baseReceived = burnForBase(
          cachedBaseReserves,
          cachedFyTokenReserves,
          cachedRealReserves,
          _lpTokens,
          getTimeTillMaturity().toString(),
          ts,
          g2,
          decimals
        );

        const baseReceived_ = ethers.utils.formatUnits(_baseReceived, decimals);
        setFyTokenReceived(undefined);
        return setBaseReceived(baseReceived_);
      } else {
        const [_baseReceived, _fyTokenReceived] = burn(cachedBaseReserves, cachedRealReserves, totalSupply, _lpTokens);

        const baseReceived_ = ethers.utils.formatUnits(_baseReceived, decimals);
        const fyTokenReceived_ = ethers.utils.formatUnits(_fyTokenReceived, decimals);
        setBaseReceived(baseReceived_);
        setFyTokenReceived(fyTokenReceived_);
      }
    };

    getPrevewData();
  }, [lpTokens, method, pool]);

  return { baseReceived, fyTokenReceived };
};

export default useRemoveLiqPreview;
