import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { AddLiquidityActions } from '../../lib/protocol/liquidity/types';
import { IPool } from '../../lib/protocol/types';
import { fyTokenForMint } from '../../utils/yieldMath';

const useAddLiqPreview = (pool: IPool, baseAmount: string, method: AddLiquidityActions, slippageTolerance = 0.001) => {
  const [lpTokenPreview, setLpTokenPreview] = useState<string>();
  const { totalSupply, decimals, contract, getTimeTillMaturity, ts, g1 } = pool;

  const _baseAmount = ethers.utils.parseUnits(baseAmount, decimals);

  useEffect(() => {
    const getPrevewData = async () => {
      const [cachedBaseReserves, cachedFyTokenReserves] = await contract.getCache();
      const cachedRealReserves = cachedFyTokenReserves.sub(totalSupply);

      const [_fyTokenToBuy] = fyTokenForMint(
        cachedBaseReserves,
        cachedRealReserves,
        cachedFyTokenReserves,
        _baseAmount,
        getTimeTillMaturity(),
        ts,
        g1,
        decimals,
        slippageTolerance
      );

      const tokensMinted = totalSupply
        .mul(_fyTokenToBuy.add(method === AddLiquidityActions.MINT_WITH_BASE ? ethers.constants.Zero : _baseAmount)) // use base amount which is equal to the fyToken amount provided to the pool
        .div(cachedRealReserves.sub(_fyTokenToBuy));
      const lpTokenPreview_ = ethers.utils.formatUnits(tokensMinted, decimals);
      setLpTokenPreview(lpTokenPreview_);
    };

    getPrevewData();
  }, [_baseAmount, contract, decimals, g1, getTimeTillMaturity, method, slippageTolerance, totalSupply, ts]);

  return { lpTokenPreview };
};

export default useAddLiqPreview;
