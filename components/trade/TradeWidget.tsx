import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import Button from '../common/Button';
import InputWrap from '../pool/InputWrap';
import { ArrowCircleDownIcon } from '@heroicons/react/solid';
import usePools from '../../hooks/protocol/usePools';
import PoolSelect from '../pool/PoolSelect';
import { IAsset, IPool } from '../../lib/protocol/types';
import useConnector from '../../hooks/useConnector';
import useTradePreview from '../../hooks/protocol/useTradePreview';
import InterestRateInput from './InterestRateInput';
import { TradeActions } from '../../lib/protocol/trade/types';
import { BorderWrap, Header } from '../styles/';
import { useTrade } from '../../hooks/protocol/useTrade';

const Inner = tw.div`m-4 text-center`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

interface ITradeForm {
  pool: IPool | undefined;
  fromAsset: IAsset | undefined;
  fromAmount: string;
  toAsset: IAsset | undefined;
  toAmount: string;
  interestRate: string;
  isFyTokenOutput: boolean;
  tradeAction: TradeActions;
}

const INITIAL_FORM_STATE: ITradeForm = {
  pool: undefined,
  fromAsset: undefined,
  fromAmount: '',
  toAsset: undefined,
  toAmount: '',
  interestRate: '',
  isFyTokenOutput: true,
  tradeAction: TradeActions.SELL_BASE,
};

const TradeWidget = () => {
  const { chainId, account } = useConnector();
  const { data: pools, loading } = usePools();

  const [form, setForm] = useState<ITradeForm>(INITIAL_FORM_STATE);
  const { fyTokenOutPreview, baseOutPreview, fyTokenInPreview, baseInPreview, interestRatePreview } = useTradePreview(
    form.pool,
    form.tradeAction,
    form.fromAmount,
    form.toAmount,
    form.isFyTokenOutput
  );
  const { pool, fromAsset, fromAmount, toAsset, toAmount, interestRate, tradeAction, isFyTokenOutput } = form;

  const [updatingFromAmount, setUpdatingFromAmount] = useState<boolean>(false);
  const [updatingToAmount, setUpdatingToAmount] = useState<boolean>(false);
  const [description, setDescription] = useState('');

  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');

  const { trade, isTrading } = useTrade(pool!, fromValue, toValue, tradeAction, description);

  const handleMaxFrom = () => {
    setUpdatingFromAmount(true);
    setUpdatingToAmount(false);
    setForm((f) => ({
      ...f,
      fromAmount: f.fromAsset?.balance_!,
    }));
  };

  const handleMaxTo = () => {
    setUpdatingFromAmount(false);
    setUpdatingToAmount(true);
    setForm((f) => ({
      ...f,
      toAmount: f.toAsset?.balance_!,
    }));
  };

  const handleClearAll = () => setForm(INITIAL_FORM_STATE);

  const handleToggleDirection = () => {
    setForm((f) => ({
      ...f,
      fromAsset: f.toAsset,
      toAsset: f.fromAsset,
      isFyTokenOutput: !f.isFyTokenOutput,
    }));
  };

  const handleSubmit = () => {
    pool && trade();
  };

  const handleInputChange = (name: string, value: string) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'fromAmount') {
      setUpdatingFromAmount(true);
      setUpdatingToAmount(false);
    } else if (name === 'toAmount') {
      setUpdatingFromAmount(false);
      setUpdatingToAmount(true);
    } else {
      setUpdatingFromAmount(false);
      setUpdatingToAmount(false);
    }
  };

  // assess what the output value should be based on the trade direction and where the user is inputting
  useEffect(() => {
    const _fromValue = () => {
      if (!updatingFromAmount && !updatingToAmount) return '';
      switch (tradeAction) {
        case TradeActions.SELL_FYTOKEN:
          return updatingFromAmount ? fromAmount : baseOutPreview;
        case TradeActions.SELL_BASE:
          return updatingFromAmount ? fromAmount : fyTokenOutPreview;
        case TradeActions.BUY_BASE:
          return updatingFromAmount ? fromAmount : fyTokenInPreview;
        case TradeActions.BUY_FYTOKEN:
          return updatingFromAmount ? fromAmount : baseInPreview;
        default:
          return '';
      }
    };
    setFromValue(_fromValue());
  }, [
    updatingFromAmount,
    fromAmount,
    baseOutPreview,
    fyTokenOutPreview,
    fyTokenInPreview,
    baseInPreview,
    tradeAction,
    updatingToAmount,
  ]);

  // assess what the output value should be based on the trade direction and where the user is inputting
  useEffect(() => {
    const _toValue = () => {
      // if (!updatingFromAmount && !updatingToAmount) return '';
      switch (tradeAction) {
        case TradeActions.SELL_FYTOKEN:
          return updatingToAmount ? toAmount : baseOutPreview;
        case TradeActions.SELL_BASE:
          return updatingToAmount ? toAmount : fyTokenOutPreview;
        case TradeActions.BUY_BASE:
          return updatingToAmount ? toAmount : baseOutPreview;
        case TradeActions.BUY_FYTOKEN:
          return updatingToAmount ? toAmount : fyTokenOutPreview;
        default:
          return '';
      }
    };
    setToValue(_toValue());
  }, [
    updatingFromAmount,
    fromAmount,
    baseOutPreview,
    fyTokenOutPreview,
    fyTokenInPreview,
    baseInPreview,
    tradeAction,
    updatingToAmount,
    toAmount,
  ]);

  // assess the trade action
  useEffect(() => {
    if (isFyTokenOutput && updatingToAmount) {
      setForm((f) => ({ ...f, tradeAction: TradeActions.BUY_FYTOKEN }));
    } else if (isFyTokenOutput && !updatingToAmount) {
      setForm((f) => ({ ...f, tradeAction: TradeActions.SELL_BASE }));
    } else if (!isFyTokenOutput && updatingToAmount) {
      setForm((f) => ({ ...f, tradeAction: TradeActions.BUY_BASE }));
    } else if (!isFyTokenOutput && !updatingToAmount) {
      setForm((f) => ({ ...f, tradeAction: TradeActions.SELL_FYTOKEN }));
    }
  }, [isFyTokenOutput, updatingToAmount, tradeAction]);

  // reset form when chainId changes
  useEffect(() => {
    setForm(INITIAL_FORM_STATE);
  }, [chainId]);

  // change the to and from form values when the pool changes
  // defaults to going from base to fyToken
  useEffect(() => {
    if (form.pool)
      setForm((f) => ({
        ...f,
        fromAsset: f.pool?.base,
        toAsset: f.pool?.fyToken,
      }));
  }, [form.pool]);

  // set trade description to use in useTrade hook
  useEffect(() => {
    const _description = `Trading ${fromAmount} ${fromAsset?.symbol} to approximately ${toAmount} ${toAsset?.symbol}`;
    setDescription(_description);
  }, [fromAmount, fromAsset, toAmount, toAsset]);

  return (
    <BorderWrap>
      <Inner>
        <TopRow>
          <Header>Trade</Header>
          <ClearButton onClick={handleClearAll}>Clear All</ClearButton>
        </TopRow>

        <Grid>
          <PoolSelect
            pools={pools}
            pool={pool}
            setPool={(p) => setForm((f) => ({ ...f, pool: p }))}
            poolsLoading={loading}
          />
          <InterestRateInput
            rate={interestRatePreview}
            setRate={(rate: string) => setForm((f) => ({ ...f, interestRate: rate }))}
            disabled={true}
          />
        </Grid>

        <div className="flex flex-col gap-1 my-5">
          <InputWrap
            name="fromAmount"
            value={fromValue}
            balance={fromAsset?.balance_!}
            item={fromAsset}
            handleChange={handleInputChange}
            unFocused={updatingToAmount && !!pool}
            useMax={handleMaxFrom}
          />
          <div className="relative flex justify-center items-center w-full">
            <div className="flex items-center justify-end relative w-full">
              <div className="absolute left-0 right-0 flex items-center justify-center">
                <ArrowCircleDownIcon
                  className="justify-self-center text-gray-400 hover:border hover:border-secondary-500 rounded-full hover:cursor-pointer z-10"
                  height={27}
                  width={27}
                  onClick={handleToggleDirection}
                />
              </div>
            </div>
          </div>
          <InputWrap
            name="toAmount"
            value={toValue}
            balance={toAsset?.balance_!}
            item={toAsset}
            handleChange={handleInputChange}
            unFocused={updatingFromAmount && !!pool}
            useMax={handleMaxTo}
          />
        </div>
        <Button action={handleSubmit} disabled={!account || !pool || isTrading}>
          {!account ? 'Connect Wallet' : 'Trade'}
        </Button>
      </Inner>
    </BorderWrap>
  );
};

export default TradeWidget;
