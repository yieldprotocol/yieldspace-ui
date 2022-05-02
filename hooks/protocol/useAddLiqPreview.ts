import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { DEFAULT_SLIPPAGE, SLIPPAGE_KEY } from '../../constants';
import { AddLiquidityActions } from '../../lib/protocol/liquidity/types';
import { IPool } from '../../lib/protocol/types';
import { fyTokenForMint, mint, mintWithBase } from '../../utils/yieldMath';
import { useLocalStorage } from '../useLocalStorage';

const useAddLiqPreview = (
  pool: IPool,
  baseAmount: string,
  method: AddLiquidityActions | undefined,
  fyTokenAmount = '',
  updatingFyTokenAmount = false
) => {
  const [lpTokenPreview, setLpTokenPreview] = useState<string>('');

  // mint state
  const [baseNeeded, setBaseNeeded] = useState<BigNumber>(ethers.constants.Zero);
  const [baseNeeded_, setBaseNeeded_] = useState<string>('');
  const [fyTokenNeeded, setFyTokenNeeded] = useState<BigNumber>(ethers.constants.Zero);
  const [fyTokenNeeded_, setFyTokenNeeded_] = useState<string>('');

  // mintWithBase state
  const [canTradeForFyToken, setCanTradeForFyToken] = useState<boolean>(true);

  // settings
  const [slippageTolerance] = useLocalStorage(SLIPPAGE_KEY, DEFAULT_SLIPPAGE);
  const slippageTolerance_ = +slippageTolerance / 100; // find better way (currently slippage in localStorage looks like "1" for "1%")

  useEffect(() => {
    setCanTradeForFyToken(true); // reset

    (async () => {
      if (pool && method) {
        const { totalSupply, decimals, contract, getTimeTillMaturity, ts, g1 } = pool;
        const timeTillMaturity = getTimeTillMaturity().toString();

        const [cachedBaseReserves, cachedFyTokenReserves] = await contract.getCache();
        const cachedRealReserves = cachedFyTokenReserves.sub(totalSupply);

        const _baseAmount = ethers.utils.parseUnits(baseAmount || '0', decimals);
        const _fyTokenAmount = ethers.utils.parseUnits(fyTokenAmount || '0', decimals);

        try {
          if (method === AddLiquidityActions.MINT) {
            // if minting with both base and fyToken, calculate how much fyToken (or base) is needed based on reserves ratios
            const [xPortion, yPortion] = mint(
              cachedBaseReserves,
              cachedRealReserves,
              totalSupply,
              updatingFyTokenAmount ? _fyTokenAmount : _baseAmount, // use the input value
              !updatingFyTokenAmount // dependent upon what value we are trying to derive (i.e.: we want baseNeeded when inputting fyTokenAmount, so fromBase is false)
            );

            // assigning to more meaningful variables for clarity
            const _fyTokenNeeded = yPortion;
            const _baseNeeded = yPortion;
            const lpTokensMinted = updatingFyTokenAmount ? yPortion : xPortion;

            setBaseNeeded(_baseNeeded);
            setBaseNeeded_(ethers.utils.formatUnits(_baseNeeded, decimals));
            setFyTokenNeeded(_fyTokenNeeded);
            setFyTokenNeeded_(ethers.utils.formatUnits(_fyTokenNeeded, decimals));
            setLpTokenPreview(ethers.utils.formatUnits(lpTokensMinted, decimals));
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
              slippageTolerance_
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

            setCanTradeForFyToken(!fyTokenToBuy.eq(ethers.constants.Zero));
            setLpTokenPreview(ethers.utils.formatUnits(minted, decimals));
          }
        } catch (e) {
          setCanTradeForFyToken(false);
          console.log(e);
        }
      }
    })();
  }, [baseAmount, fyTokenAmount, method, pool, slippageTolerance_, updatingFyTokenAmount]);

  return { lpTokenPreview, fyTokenNeeded, fyTokenNeeded_, canTradeForFyToken, baseNeeded, baseNeeded_ };
};

export default useAddLiqPreview;
