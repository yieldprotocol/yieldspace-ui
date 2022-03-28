import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { DEFAULT_SLIPPAGE, SLIPPAGE_KEY } from '../../constants';
import { AddLiquidityActions } from '../../lib/protocol/liquidity/types';
import { IPool } from '../../lib/protocol/types';
import { fyTokenForMint, mint, mintWithBase, splitLiquidity } from '../../utils/yieldMath';

const useAddLiqPreview = (pool: IPool, baseAmount: string, method: AddLiquidityActions | undefined) => {
  const [lpTokenPreview, setLpTokenPreview] = useState<string>();
  const [fyTokenNeeded, setFyTokenNeeded] = useState<string>();
  // const [slippageTolerance] = useLocalStorage(SLIPPAGE_KEY, DEFAULT_SLIPPAGE);
  const slippageTolerance = DEFAULT_SLIPPAGE;

  useEffect(() => {
    (async () => {
      if (pool && baseAmount !== '' && method) {
        const { totalSupply, decimals, contract, getTimeTillMaturity, ts, g1 } = pool;
        const timeTillMaturity = getTimeTillMaturity().toString();

        const _baseAmount = ethers.utils.parseUnits(baseAmount || '0', decimals);
        const [cachedBaseReserves, cachedFyTokenReserves] = await contract.getCache();
        const cachedRealReserves = cachedFyTokenReserves.sub(totalSupply);

        // if minting with both base and fyToken, calculate how much fyToken is needed
        if (method === AddLiquidityActions.MINT) {
          const [, _fyTokenNeeded] = splitLiquidity(cachedBaseReserves, cachedRealReserves, _baseAmount);
          setFyTokenNeeded(ethers.utils.formatUnits(_fyTokenNeeded, decimals));

          const [minted] = mint(
            cachedBaseReserves,
            cachedRealReserves,
            totalSupply,
            BigNumber.from(_fyTokenNeeded),
            false
          );
          setLpTokenPreview(ethers.utils.formatUnits(minted, decimals));
        } else {
          // minting with base
          const [fyTokenToBuy] = fyTokenForMint(
            cachedBaseReserves,
            cachedRealReserves,
            cachedFyTokenReserves,
            _baseAmount,
            timeTillMaturity,
            ts,
            g1,
            decimals,
            +slippageTolerance
          );

          const [minted] = mintWithBase(
            cachedBaseReserves,
            cachedFyTokenReserves,
            cachedRealReserves,
            fyTokenToBuy,
            timeTillMaturity,
            ts,
            g1,
            decimals
          );

          setLpTokenPreview(ethers.utils.formatUnits(minted, decimals));
        }
      }
    })();
  }, [baseAmount, method, pool, slippageTolerance]);

  return { lpTokenPreview, fyTokenNeeded };
};

export default useAddLiqPreview;
