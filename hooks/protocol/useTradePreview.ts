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
  tradeAction: TradeActions | undefined,
  fromInput: string,
  toInput: string
) => {
  const [fyTokenOutPreview, setFyTokenOutPreview] = useState<string>('');
  const [fyTokenInPreview, setFyTokenInPreview] = useState<string>('');

  const [baseOutPreview, setBaseOutPreview] = useState<string>('');
  const [baseInPreview, setBaseInPreview] = useState<string>('');

  const [interestRatePreview, setInterestRatePreview] = useState<string>('');

  const [maxFyTokenIn_, setMaxFyTokenIn] = useState<string>();
  const [maxBaseIn_, setMaxBaseIn] = useState<string>();
  const [maxFyTokenOut_, setMaxFyTokenOut] = useState<string>();
  const [maxBaseOut_, setMaxBaseOut] = useState<string>();

  const validatePreview = (preview: BigNumber) => (preview.lt(ethers.constants.Zero) ? ethers.constants.Zero : preview);
  const isFyTokenOutput = [TradeActions.SELL_BASE, TradeActions.BUY_FYTOKEN].includes(tradeAction!);

  useEffect(() => {
    if (!tradeAction) return;

    if (pool) {
      const { baseReserves, fyTokenReserves, ts, g1, g2, decimals, maturity, base, fyToken } = pool;
      const getTimeTillMaturity = () => maturity - Math.round(new Date().getTime() / 1000);
      const timeTillMaturity = getTimeTillMaturity().toString();

      // sellBase
      // fyTokenOutForBaseIn
      if (tradeAction === TradeActions.SELL_BASE) {
        const baseIn_ = fromInput === '' ? '0' : cleanValue(fromInput, decimals);
        const baseIn = ethers.utils.parseUnits(baseIn_, decimals);

        const _fyTokenOutPreview = sellBase(baseReserves, fyTokenReserves, baseIn, timeTillMaturity, ts, g1, decimals);
        setFyTokenOutPreview(ethers.utils.formatUnits(validatePreview(_fyTokenOutPreview), decimals));
        setInterestRatePreview(cleanValue(calculateAPR(baseIn, _fyTokenOutPreview, maturity)!, 2));
      } else if (tradeAction === TradeActions.SELL_FYTOKEN) {
        // sellFyToken
        // baseOutForFYTokenIn
        const fyTokenIn_ = fromInput === '' ? '0' : cleanValue(fromInput, decimals);
        const fyTokenIn = ethers.utils.parseUnits(fyTokenIn_, decimals);

        const _baseOutPreview = sellFYToken(
          baseReserves,
          fyTokenReserves,
          fyTokenIn,
          timeTillMaturity,
          ts,
          g2,
          decimals
        );

        setBaseOutPreview(ethers.utils.formatUnits(validatePreview(_baseOutPreview), decimals));
        setInterestRatePreview('-' + cleanValue(calculateAPR(_baseOutPreview, fyTokenIn, maturity)!, 2)); // negative value to convey paying debt/value when swapping from fyToken to base
      } else if (tradeAction === TradeActions.BUY_BASE) {
        // buyBase
        // fyTokenInForBaseOut
        const baseOut_ = toInput === '' ? '0' : cleanValue(toInput, decimals);
        const baseOut = ethers.utils.parseUnits(baseOut_, decimals);

        const _fyTokenInPreview = buyBase(baseReserves, fyTokenReserves, baseOut, timeTillMaturity, ts, g2, decimals);
        setFyTokenInPreview(ethers.utils.formatUnits(validatePreview(_fyTokenInPreview), decimals));
        setInterestRatePreview('-' + cleanValue(calculateAPR(baseOut, _fyTokenInPreview, maturity)!, 2)); // negative value to convey paying debt/value when swapping from fyToken to base
      } else if (tradeAction === TradeActions.BUY_FYTOKEN) {
        // buyFYToken
        // baseInForFYTokenOut
        const fyTokenOut_ = toInput === '' ? '0' : cleanValue(toInput, decimals);
        const fyTokenOut = ethers.utils.parseUnits(fyTokenOut_, decimals);

        const _baseInPreview = buyFYToken(
          baseReserves,
          fyTokenReserves,
          fyTokenOut,
          timeTillMaturity,
          ts,
          g1,
          decimals
        );
        setBaseInPreview(ethers.utils.formatUnits(validatePreview(_baseInPreview), decimals));
        setInterestRatePreview(cleanValue(calculateAPR(_baseInPreview, fyTokenOut, maturity)!, 2));
      }

      /* Get maxes */
      const _maxFyTokenIn = maxFyTokenIn(baseReserves, fyTokenReserves, timeTillMaturity, ts, g2, decimals);
      setMaxFyTokenIn(cleanValue(ethers.utils.formatUnits(_maxFyTokenIn, decimals), fyToken.digitFormat));

      const _maxBaseIn = maxBaseIn(baseReserves, fyTokenReserves, timeTillMaturity, ts, g1, decimals);
      setMaxBaseIn(cleanValue(ethers.utils.formatUnits(_maxBaseIn, decimals), base.digitFormat));

      const _maxFyTokenOut = maxFyTokenOut(baseReserves, fyTokenReserves, timeTillMaturity, ts, g1, decimals);
      setMaxFyTokenOut(cleanValue(ethers.utils.formatUnits(_maxFyTokenOut, decimals), fyToken.digitFormat));

      const _maxBaseout = maxBaseOut(baseReserves, fyTokenReserves, timeTillMaturity, ts, g2, decimals);
      setMaxBaseOut(cleanValue(ethers.utils.formatUnits(_maxBaseout, decimals), base.digitFormat));
    }
  }, [fromInput, isFyTokenOutput, pool, tradeAction, toInput]);

  return {
    fyTokenOutPreview,
    baseOutPreview,
    fyTokenInPreview,
    baseInPreview,
    interestRatePreview: +interestRatePreview === 0 ? '0' : interestRatePreview,
    maxFyTokenIn: maxFyTokenIn_,
    maxBaseIn: maxBaseIn_,
    maxFyTokenOut: maxFyTokenOut_,
    maxBaseOut: maxBaseOut_,
  };
};

export default useTradePreview;
