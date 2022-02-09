import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { TradeActions } from '../../lib/protocol/trade/types';
import { IPool } from '../../lib/protocol/types';
import { cleanValue } from '../../utils/appUtils';
import { buyBase, buyFYToken, sellBase, sellFYToken } from '../../utils/yieldMath';

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
          pool?.getTimeTillMaturity(),
          pool.ts,
          pool.g1,
          pool.decimals
        );
        setFyTokenOutPreview(ethers.utils.formatUnits(_fyTokenOutPreview, pool.decimals));
      } else if (tradeAction === TradeActions.SELL_FYTOKEN) {
        // sellFyToken
        // baseOutForFYTokenIn
        const fyTokenIn_ = fromInput === '' ? '0' : cleanValue(fromInput, pool.decimals);
        const fyTokenIn = ethers.utils.parseUnits(fyTokenIn_, pool.decimals);

        const _baseOutPreview = sellFYToken(
          pool.baseReserves,
          pool.fyTokenReserves,
          fyTokenIn,
          pool?.getTimeTillMaturity(),
          pool.ts,
          pool.g2,
          pool.decimals
        );

        setBaseOutPreview(ethers.utils.formatUnits(_baseOutPreview, pool.decimals));
      } else if (tradeAction === TradeActions.BUY_BASE) {
        // buyBase
        // fyTokenInForBaseOut
        const baseOut_ = toInput === '' ? '0' : cleanValue(toInput, pool.decimals);
        const baseOut = ethers.utils.parseUnits(baseOut_, pool.decimals);

        const _fyTokenInPreview = buyBase(
          pool.baseReserves,
          pool.fyTokenReserves,
          baseOut,
          pool?.getTimeTillMaturity(),
          pool.ts,
          pool.g2,
          pool.decimals
        );
        setFyTokenInPreview(ethers.utils.formatUnits(_fyTokenInPreview, pool.decimals));
      } else if (tradeAction === TradeActions.BUY_FYTOKEN) {
        // buyFYToken
        // baseInForFYTokenOut
        const fyTokenOut_ = toInput === '' ? '0' : cleanValue(toInput, pool.decimals);
        const fyTokenOut = ethers.utils.parseUnits(fyTokenOut_, pool.decimals);

        const _baseInPreview = buyFYToken(
          pool.baseReserves,
          pool.fyTokenReserves,
          fyTokenOut,
          pool?.getTimeTillMaturity(),
          pool.ts,
          pool.g1,
          pool.decimals
        );
        setBaseInPreview(ethers.utils.formatUnits(_baseInPreview, pool.decimals));
      }
    }
  }, [fromInput, isFyTokenOutput, pool, tradeAction, toInput]);

  return { fyTokenOutPreview, baseOutPreview, fyTokenInPreview, baseInPreview };
};

export default useTradePreview;
