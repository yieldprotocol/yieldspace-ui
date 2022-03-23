import { useEffect, useState } from 'react';
import { AddLiquidityActions, RemoveLiquidityActions } from '../lib/protocol/liquidity/types';
import { TradeActions } from '../lib/protocol/trade/types';
import { IPool } from '../lib/protocol/types';
import useAddLiqPreview from './protocol/useAddLiqPreview';
import useConnector from './useConnector';

const useInputValidation = (
  input: string | undefined,
  pool: IPool | undefined,
  limits: (number | string | undefined)[],
  action: TradeActions | AddLiquidityActions | RemoveLiquidityActions
) => {
  const { account } = useConnector();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const _input = parseFloat(input!);
  const aboveMax = !!limits[1] && _input > parseFloat(limits[1].toString());
  const belowMin = !!limits[0] && _input < parseFloat(limits[0].toString());

  // calculate the fyTokenNeeded for minting with both base and fyToken; only used with MINT
  const { fyTokenNeeded } = useAddLiqPreview(pool!, input!, AddLiquidityActions.MINT);

  useEffect(() => {
    if (!account) {
      return setErrorMsg('Please connect');
    }

    if (!pool) {
      return setErrorMsg('Select pool');
    }

    if (!input) {
      return setErrorMsg('Enter an amount');
    }

    if (_input <= 0) {
      return setErrorMsg('Amount must be greater than 0');
    }

    setErrorMsg(null); // reset

    const { base, fyToken } = pool;
    const baseBalance = parseFloat(pool.base.balance_);
    const fyTokenBalance = parseFloat(pool.fyToken.balance_);
    const lpTokenBalance = parseFloat(pool.lpTokenBalance_);

    /* Action specific validation */
    switch (action) {
      case TradeActions.SELL_BASE:
      case TradeActions.BUY_FYTOKEN:
        aboveMax && setErrorMsg(`Max tradable ${base.symbol} is ${limits[1]} `);
        baseBalance < _input && setErrorMsg(`Insufficient ${base.symbol} balance`);
        break;
      case TradeActions.SELL_FYTOKEN:
      case TradeActions.BUY_BASE:
        aboveMax && setErrorMsg(`Max tradable ${fyToken.symbol} is ${limits[1]} `);
        fyTokenBalance < _input && setErrorMsg(`Insufficient ${fyToken.symbol} balance`);
        break;
      case AddLiquidityActions.MINT_WITH_BASE:
        baseBalance < _input && setErrorMsg(`Insufficient ${base.symbol} balance`);
        break;
      case AddLiquidityActions.MINT:
        baseBalance < _input && setErrorMsg(`Insufficient ${base.symbol} balance`);
        fyTokenBalance < +fyTokenNeeded! && setErrorMsg(`Insufficient ${fyToken.symbol} balance`);
        break;
      case RemoveLiquidityActions.BURN_FOR_BASE:
      case RemoveLiquidityActions.BURN:
        lpTokenBalance < _input && setErrorMsg(`Insufficient LP token balance`);
        break;
      default:
        setErrorMsg(null);
        break;
    }
  }, [account, pool, input, action, aboveMax, _input, belowMin, limits, fyTokenNeeded]);

  return { errorMsg };
};

export default useInputValidation;
