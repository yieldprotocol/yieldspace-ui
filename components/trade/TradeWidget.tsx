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

const BorderWrap = tw.div`mx-auto max-w-md p-2 border border-secondary-400 shadow-sm rounded-lg dark:bg-gray-800 bg-gray-200 text-gray-800 dark:text-gray-50`;
const Inner = tw.div`m-4 text-center`;
const Header = tw.div`text-lg font-bold justify-items-start align-middle`;
const HeaderText = tw.span`align-middle`;

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
  const { fyTokenOutPreview, baseOutPreview, fyTokenInPreview, baseInPreview } = useTradePreview(
    form.pool,
    form.tradeAction,
    form.fromAmount,
    form.toAmount,
    form.isFyTokenOutput
  );
  const [updatingFromAmount, setUpdatingFromAmount] = useState<boolean>(false);
  const [updatingToAmount, setUpdatingToAmount] = useState<boolean>(false);

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
    console.log('submitting trade with details', form);
  };

  const handleInputChange = (name: string, value: string) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'fromAmount') {
      setUpdatingFromAmount(true);
      setUpdatingToAmount(false);
    } else {
      setUpdatingFromAmount(false);
      setUpdatingToAmount(true);
    }
  };

  // assess what the output value should be based on the trade direction and where the user is inputting
  const fromValue = () => {
    switch (form.tradeAction) {
      case TradeActions.SELL_FYTOKEN:
        return updatingFromAmount ? fromAmount : baseOutPreview;
      case TradeActions.SELL_BASE:
        return updatingFromAmount ? fromAmount : fyTokenOutPreview;
      case TradeActions.BUY_BASE:
        return updatingFromAmount ? fromAmount : fyTokenInPreview;
      case TradeActions.BUY_FYTOKEN:
        return updatingFromAmount ? fromAmount : baseInPreview;
      default:
        return toAmount;
    }
  };

  // assess what the output value should be based on the trade direction and where the user is inputting
  const toValue = () => {
    switch (form.tradeAction) {
      case TradeActions.SELL_FYTOKEN:
        return updatingToAmount ? toAmount : baseOutPreview;
      case TradeActions.SELL_BASE:
        return updatingToAmount ? toAmount : fyTokenOutPreview;
      case TradeActions.BUY_BASE:
        return updatingToAmount ? toAmount : baseOutPreview;
      case TradeActions.BUY_FYTOKEN:
        return updatingToAmount ? toAmount : fyTokenOutPreview;
      default:
        return toAmount;
    }
  };

  // assess the trade action
  useEffect(() => {
    if (form.isFyTokenOutput && updatingToAmount) {
      setForm((f) => ({ ...f, tradeAction: TradeActions.BUY_FYTOKEN }));
    } else if (form.isFyTokenOutput && !updatingToAmount) {
      setForm((f) => ({ ...f, tradeAction: TradeActions.SELL_BASE }));
    } else if (!form.isFyTokenOutput && updatingToAmount) {
      setForm((f) => ({ ...f, tradeAction: TradeActions.BUY_BASE }));
    } else if (!form.isFyTokenOutput && !updatingToAmount) {
      setForm((f) => ({ ...f, tradeAction: TradeActions.SELL_FYTOKEN }));
    }
  }, [form.isFyTokenOutput, updatingToAmount, form.tradeAction]);

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

  const { pool, fromAsset, fromAmount, toAsset, toAmount, interestRate } = form;

  return (
    <BorderWrap>
      <Inner>
        <TopRow>
          <Header>
            <HeaderText>Trade</HeaderText>
          </Header>
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
            rate={interestRate}
            setRate={(rate: string) => setForm((f) => ({ ...f, interestRate: rate }))}
          />
        </Grid>

        <Grid>
          <InputWrap
            name="fromAmount"
            value={fromValue()}
            balance={fromAsset?.balance_!}
            asset={fromAsset}
            handleChange={handleInputChange}
            disabled={updatingToAmount && !!pool}
          />
          <ArrowCircleDownIcon
            className="justify-self-center text-gray-400 hover:border hover:border-secondary-500 rounded-full hover:cursor-pointer"
            height={27}
            width={27}
            onClick={handleToggleDirection}
          />
          <InputWrap
            name="toAmount"
            value={toValue()}
            balance={toAsset?.balance_!}
            asset={toAsset}
            handleChange={handleInputChange}
            disabled={updatingFromAmount && !!pool}
          />
        </Grid>
        <Button action={handleSubmit} disabled={!account}>
          {!account ? 'Connect Wallet' : 'Trade'}
        </Button>
      </Inner>
    </BorderWrap>
  );
};

export default TradeWidget;
