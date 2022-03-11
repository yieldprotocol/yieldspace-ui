import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { RemoveLiquidityActions } from '../../lib/protocol/liquidity/types';
import { IPool } from '../../lib/protocol/types';
import { burn, burnForBase, newPoolState, sellFYToken } from '../../utils/yieldMath';

const useRemoveLiqPreview = (
  pool: IPool,
  lpTokens: string,
  method: RemoveLiquidityActions,
  slippageTolerance = 0.001
) => {
  const [baseReceived, setBaseReceived] = useState<string>();
  const [fyTokenReceived, setFyTokenReceived] = useState<string>();
  const { totalSupply, decimals, contract, getTimeTillMaturity, ts, g2 } = pool;

  const _lpTokens = ethers.utils.parseUnits(lpTokens, decimals);

  useEffect(() => {
    const getPrevewData = async () => {
      const [cachedBaseReserves, cachedFyTokenReserves] = await contract.getCache();
      const cachedRealReserves = cachedFyTokenReserves.sub(totalSupply);

      if (method === RemoveLiquidityActions.BURN_FOR_BASE) {
        const _baseReceived = burnForBase(
          cachedBaseReserves,
          cachedFyTokenReserves,
          cachedRealReserves,
          _lpTokens,
          getTimeTillMaturity(),
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
  }, [_lpTokens, contract, decimals, g2, getTimeTillMaturity, method, totalSupply, ts]);

  return { baseReceived, fyTokenReceived };
};

export default useRemoveLiqPreview;
