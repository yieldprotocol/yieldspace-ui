import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { TradeActions } from '../../lib/protocol/trade';
import { IPool } from '../../lib/protocol/types';
import { cleanValue } from '../../utils/appUtils';
import { sellBase, sellFYToken } from '../../utils/yieldMath';

const useTradePreview = (
  pool: IPool | undefined,
  tradeAction: TradeActions,
  fromInput: string,
  toInput: string,
  isFyTokenOutput: boolean
) => {
  const [fyTokenOutPreview, setFyTokenOutPreview] = useState<string>('');
  const [fyTokenOutInPreview, setFyTokenInPreview] = useState<string>('');

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
      } else {
        // sellFyToken
        // baseOutForFYTokenIn
        const fyTokenIn_ = fromInput === '' ? '0' : cleanValue(fromInput, pool.decimals);
        const fyTokenIn = ethers.utils.parseUnits(fyTokenIn_, pool.decimals);

        sellFYToken(
          pool.baseReserves,
          pool.fyTokenReserves,
          fyTokenIn,
          pool?.getTimeTillMaturity(),
          pool.ts,
          pool.g2,
          pool.decimals
        );
      }
    }
  }, [fromInput, isFyTokenOutput, pool, tradeAction]);

  return { fyTokenOutPreview, baseOutPreview };
};

export default useTradePreview;
