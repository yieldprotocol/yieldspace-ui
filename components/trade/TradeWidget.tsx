import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import Button from '../common/Button';
import InputWrap from '../pool/InputWrap';
import usePools from '../../hooks/protocol/usePools';
import PoolSelect from '../pool/PoolSelect';
import { IAsset, IPool } from '../../lib/protocol/types';
import useConnector from '../../hooks/useConnector';
import useTradePreview from '../../hooks/protocol/useTradePreview';
import InterestRateInput from './InterestRateInput';
import { TradeActions } from '../../lib/protocol/trade/types';
import { BorderWrap, Header } from '../styles/';
import { useTrade } from '../../hooks/protocol/useTrade';
import Arrow from './Arrow';
import Modal from '../common/Modal';
import TradeConfirmation from './TradeConfirmation';
import InputsWrap from '../styles/InputsWrap';
import CloseButton from '../common/CloseButton';
import { calculateSlippage } from '../../utils/yieldMath';
import { cleanValue } from '../../utils/appUtils';
import useInputValidation from '../../hooks/useInputValidation';

const Inner = tw.div`m-4 text-center`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

export interface ITradeForm {
  pool: IPool | undefined;
  fromAsset: IAsset | undefined;
  fromAmount: string;
  toAsset: IAsset | undefined;
  toAmount: string;
  isFyTokenOutput: boolean;
  tradeAction: TradeActions;
  toAmountLessSlippage: string;
}

const INITIAL_FORM_STATE: ITradeForm = {
  pool: undefined,
  fromAsset: undefined,
  fromAmount: '',
  toAsset: undefined,
  toAmount: '',
  isFyTokenOutput: true,
  tradeAction: TradeActions.SELL_BASE,
  toAmountLessSlippage: '',
};

const TradeWidget = () => {
  const { chainId, account } = useConnector();
  const { data: pools, loading } = usePools();

  const [form, setForm] = useState<ITradeForm>(INITIAL_FORM_STATE);
  const {
    fyTokenOutPreview,
    baseOutPreview,
    fyTokenInPreview,
    baseInPreview,
    interestRatePreview,
    maxFyTokenIn,
    maxBaseIn,
  } = useTradePreview(form.pool, form.tradeAction, form.fromAmount, form.toAmount, form.isFyTokenOutput);
  const { pool, fromAsset, fromAmount, toAsset, toAmount, tradeAction, isFyTokenOutput } = form;

  const max = isFyTokenOutput ? maxBaseIn : maxFyTokenIn; // max limit to be used in validation
  const { errorMsg } = useInputValidation(fromAmount, pool!, [0, max], tradeAction);

  const [updatingFromAmount, setUpdatingFromAmount] = useState<boolean>(false);
  const [updatingToAmount, setUpdatingToAmount] = useState<boolean>(false);
  const [description, setDescription] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [slippageTolerance] = useState<number>(0.05);

  const { trade, isTransacting, tradeSubmitted } = useTrade(
    pool!,
    fromAmount,
    toAmount,
    tradeAction,
    description,
    slippageTolerance
  );

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
    setConfirmModalOpen(true);
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
    setForm((f) => ({ ...f, fromAmount: _fromValue() }));
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
      if (!updatingFromAmount && !updatingToAmount) return '';
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
    setForm((f) => ({ ...f, toAmount: _toValue() }));
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
    const _description = `Trade ${fromAmount} ${fromAsset?.symbol} to ~${cleanValue(toAmount, toAsset?.digitFormat)} ${
      toAsset?.symbol
    }`;
    setDescription(_description);
  }, [fromAmount, fromAsset, toAmount, toAsset]);

  // close modal when the trade was successfullly submitted (user took all actions to get tx through)
  useEffect(() => {
    if (tradeSubmitted) {
      setConfirmModalOpen(false);
      setForm((f) => ({ ...f, fromAmount: '', toAmount: '' }));
    }
  }, [tradeSubmitted]);

  // update the form's from/toAssets whenever the pool changes (i.e. when the user interacts and balances change)
  useEffect(() => {
    const _pool = pools && pool?.address! in pools ? pools[pool?.address!] : undefined;
    if (_pool) {
      const _fromAsset = isFyTokenOutput ? _pool.base : _pool.fyToken;
      const _toAsset = isFyTokenOutput ? _pool.fyToken : _pool.base;
      setForm((f) => ({ ...f, pool: _pool, fromAsset: _fromAsset, toAsset: _toAsset }));
    }
  }, [pools, pool, isFyTokenOutput]);

  useEffect(() => {
    if (toAmount) {
      setForm((f) => ({ ...f, toAmountLessSlippage: calculateSlippage(toAmount, slippageTolerance.toString(), true) }));
    }
  }, [slippageTolerance, toAmount]);

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

        <InputsWrap>
          <InputWrap
            name="fromAmount"
            value={fromAmount}
            balance={fromAsset?.balance_!}
            item={fromAsset}
            handleChange={handleInputChange}
            unFocused={updatingToAmount && !!pool}
            useMax={handleMaxFrom}
            pool={pool}
          />
          <Arrow toggleDirection={handleToggleDirection} />
          <InputWrap
            name="toAmount"
            value={toAmount}
            balance={toAsset?.balance_!}
            item={toAsset}
            handleChange={handleInputChange}
            unFocused={updatingFromAmount && !!pool}
            useMax={handleMaxTo}
            pool={pool}
          />
        </InputsWrap>
        <Button
          action={handleSubmit}
          disabled={!account || !pool || isTransacting || !!errorMsg}
          loading={isTransacting}
        >
          {!account ? 'Connect Wallet' : isTransacting ? 'Trade Initiated...' : errorMsg ? errorMsg : 'Trade'}
        </Button>
        {confirmModalOpen && pool && (
          <Modal isOpen={confirmModalOpen} setIsOpen={setConfirmModalOpen}>
            <TopRow>
              <Header>Confirm Trade</Header>
              <CloseButton action={() => setConfirmModalOpen(false)} height="1.2rem" width="1.2rem" />
            </TopRow>
            <TradeConfirmation
              form={form}
              interestRate={interestRatePreview}
              action={trade}
              disabled={!account || !pool || isTransacting || !!errorMsg}
              loading={isTransacting}
            />
          </Modal>
        )}
      </Inner>
    </BorderWrap>
  );
};

export default TradeWidget;
