import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { AddLiquidityActions } from '../../lib/protocol/liquidity/types';
import { IPool } from '../../lib/protocol/types';
import { fyTokenForMint, mint, mintWithBase, splitLiquidity } from '../../utils/yieldMath';

const useAddLiqPreview = (pool: IPool, baseAmount: string, method: AddLiquidityActions, slippageTolerance = 0.001) => {
  const [lpTokenPreview, setLpTokenPreview] = useState<string>();
  const [fyTokenNeeded, setFyTokenNeeded] = useState<string>();

  useEffect(() => {
    (async () => {
      if (!pool) {
        return setLpTokenPreview('');
      }
      const { totalSupply, decimals, contract, getTimeTillMaturity, ts, g1 } = pool;
      const timeTillMaturity = getTimeTillMaturity().toString();

      const _baseAmount = ethers.utils.parseUnits(baseAmount || '0', decimals);
      const [cachedBaseReserves, cachedFyTokenReserves] = await contract.getCache();
      const cachedRealReserves = cachedFyTokenReserves.sub(totalSupply);

      // if minting with both base and fyToken, calculate how much fyToken is needed
      const [, _fyTokenNeeded] = splitLiquidity(cachedBaseReserves, cachedRealReserves, _baseAmount);
      setFyTokenNeeded(ethers.utils.formatUnits(_fyTokenNeeded, decimals));

      const [_fyTokenToBuy] = fyTokenForMint(
        cachedBaseReserves,
        cachedRealReserves,
        cachedFyTokenReserves,
        _baseAmount,
        timeTillMaturity,
        ts,
        g1,
        decimals,
        slippageTolerance
      );

      const [minted] =
        method === AddLiquidityActions.MINT_WITH_BASE
          ? mintWithBase(
              cachedBaseReserves,
              cachedFyTokenReserves,
              cachedRealReserves,
              _fyTokenToBuy,
              timeTillMaturity,
              ts,
              g1,
              decimals
            )
          : mint(cachedBaseReserves, cachedRealReserves, totalSupply, BigNumber.from(_fyTokenNeeded), false);

      setLpTokenPreview(ethers.utils.formatUnits(minted, decimals));
    })();
  }, [baseAmount, method, pool, slippageTolerance]);

  return { lpTokenPreview, fyTokenNeeded };
};

export default useAddLiqPreview;
