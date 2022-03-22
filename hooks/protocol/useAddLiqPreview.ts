import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { AddLiquidityActions } from '../../lib/protocol/liquidity/types';
import { IPool } from '../../lib/protocol/types';
import { cleanValue } from '../../utils/appUtils';
import { fyTokenForMint, splitLiquidity } from '../../utils/yieldMath';

const useAddLiqPreview = (pool: IPool, baseAmount: string, method: AddLiquidityActions, slippageTolerance = 0.001) => {
  const [lpTokenPreview, setLpTokenPreview] = useState<string>();
  const [fyTokenNeeded, setFyTokenNeeded] = useState<string>();

  useEffect(() => {
    const getPrevewData = async () => {
      if (!pool) {
        return setLpTokenPreview('');
      }
      const { totalSupply, decimals, contract, getTimeTillMaturity, ts, g1, base } = pool;

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
        getTimeTillMaturity().toString(),
        ts,
        g1,
        decimals,
        slippageTolerance
      );

      const tokensMinted = totalSupply
        .mul(_fyTokenToBuy.add(method === AddLiquidityActions.MINT_WITH_BASE ? ethers.constants.Zero : _baseAmount)) // use base amount which is equal to the fyToken amount provided to the pool
        .div(cachedRealReserves.sub(_fyTokenToBuy));

      const lpTokenPreview_ = ethers.utils.formatUnits(tokensMinted, decimals);
      setLpTokenPreview(cleanValue(lpTokenPreview_, base.digitFormat));
    };

    getPrevewData();
  }, [baseAmount, method, pool, slippageTolerance]);

  return { lpTokenPreview, fyTokenNeeded };
};

export default useAddLiqPreview;
