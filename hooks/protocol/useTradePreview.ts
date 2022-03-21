import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { TradeActions } from '../../lib/protocol/trade/types';
import { IPool } from '../../lib/protocol/types';
import { cleanValue } from '../../utils/appUtils';
import {
  buyBase,
  buyFYToken,
  calculateAPR,
  maxBaseIn,
  maxBaseOut,
  maxFyTokenIn,
  maxFyTokenOut,
  sellBase,
  sellFYToken,
} from '../../utils/yieldMath';

const useTradePreview = (
  pool: IPool | undefined,
  tradeAction: TradeActions,
  fromInput: string,
  toInput: string,
  isFyTokenOutput: boolean
) => {
  const [fyTokenOutPreview, setFyTokenOutPreview] = useState<string>('');
  const [fyTokenInPreview, setFyTokenInPreview] = useState<string>('');

  const [baseOutPreview, setBaseOutPreview] = useState<string>('');
  const [baseInPreview, setBaseInPreview] = useState<string>('');

  const [interestRatePreview, setInterestRatePreview] = useState<string>('');

  const [maxFyTokenIn_, setMaxFyTokenIn] = useState<string>();
  const [maxBaseIn_, setMaxBaseIn] = useState<string>();

  const validatePreview = (preview: BigNumber) => (preview.lt(ethers.constants.Zero) ? ethers.constants.Zero : preview);

  useEffect(() => {
    if (pool) {
      // sellBase
      // fyTokenOutForBaseIn
      if (tradeAction === TradeActions.SELL_BASE) {
        const baseIn_ = fromInput === '' ? '0' : cleanValue(fromInput, pool.decimals);
        const baseIn = ethers.utils.parseUnits(baseIn_, pool.decimals);

        const _fyTokenOutPreview = sellBase(
          pool.baseReserves,
          pool.fyTokenReserves,
          baseIn,
          pool?.getTimeTillMaturity().toString(),
          pool.ts,
          pool.g1,
          pool.decimals
        );
        setFyTokenOutPreview(ethers.utils.formatUnits(validatePreview(_fyTokenOutPreview), pool.decimals));
        setInterestRatePreview(cleanValue(calculateAPR(baseIn, _fyTokenOutPreview, pool.maturity)!, 2));
      } else if (tradeAction === TradeActions.SELL_FYTOKEN) {
        // sellFyToken
        // baseOutForFYTokenIn
        const fyTokenIn_ = fromInput === '' ? '0' : cleanValue(fromInput, pool.decimals);
        const fyTokenIn = ethers.utils.parseUnits(fyTokenIn_, pool.decimals);

        const _baseOutPreview = sellFYToken(
          pool.baseReserves,
          pool.fyTokenReserves,
          fyTokenIn,
          pool?.getTimeTillMaturity().toString(),
          pool.ts,
          pool.g2,
          pool.decimals
        );

        setBaseOutPreview(ethers.utils.formatUnits(validatePreview(_baseOutPreview), pool.decimals));
        setInterestRatePreview(cleanValue(calculateAPR(_baseOutPreview, fyTokenIn, pool.maturity)!, 2));
      } else if (tradeAction === TradeActions.BUY_BASE) {
        // buyBase
        // fyTokenInForBaseOut
        const baseOut_ = toInput === '' ? '0' : cleanValue(toInput, pool.decimals);
        const baseOut = ethers.utils.parseUnits(baseOut_, pool.decimals);

        const _fyTokenInPreview = buyBase(
          pool.baseReserves,
          pool.fyTokenReserves,
          baseOut,
          pool?.getTimeTillMaturity().toString(),
          pool.ts,
          pool.g2,
          pool.decimals
        );
        setFyTokenInPreview(ethers.utils.formatUnits(validatePreview(_fyTokenInPreview), pool.decimals));
        setInterestRatePreview(cleanValue(calculateAPR(baseOut, _fyTokenInPreview, pool.maturity)!, 2));
      } else if (tradeAction === TradeActions.BUY_FYTOKEN) {
        // buyFYToken
        // baseInForFYTokenOut
        const fyTokenOut_ = toInput === '' ? '0' : cleanValue(toInput, pool.decimals);
        const fyTokenOut = ethers.utils.parseUnits(fyTokenOut_, pool.decimals);

        const _baseInPreview = buyFYToken(
          pool.baseReserves,
          pool.fyTokenReserves,
          fyTokenOut,
          pool?.getTimeTillMaturity().toString(),
          pool.ts,
          pool.g1,
          pool.decimals
        );
        setBaseInPreview(ethers.utils.formatUnits(validatePreview(_baseInPreview), pool.decimals));
        setInterestRatePreview(cleanValue(calculateAPR(_baseInPreview, fyTokenOut, pool.maturity)!, 2));
      }

      /* Get maxes */
      const _maxFyTokenIn = maxFyTokenIn(
        pool.baseReserves,
        pool.fyTokenReserves,
        pool.getTimeTillMaturity().toString(),
        pool.ts,
        pool.g2,
        pool.decimals
      );
      setMaxFyTokenIn(cleanValue(ethers.utils.formatUnits(_maxFyTokenIn, pool.decimals), pool.fyToken.digitFormat));

      const _maxBaseIn = maxBaseIn(
        pool.baseReserves,
        pool.fyTokenReserves,
        pool.getTimeTillMaturity().toString(),
        pool.ts,
        pool.g1,
        pool.decimals
      );
      setMaxBaseIn(cleanValue(ethers.utils.formatUnits(_maxBaseIn, pool.decimals), pool.base.digitFormat));
    }
  }, [fromInput, isFyTokenOutput, pool, tradeAction, toInput]);

  return {
    fyTokenOutPreview,
    baseOutPreview,
    fyTokenInPreview,
    baseInPreview,
    interestRatePreview,
    maxFyTokenIn: maxFyTokenIn_,
    maxBaseIn: maxBaseIn_,
  };
};

export default useTradePreview;
