import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import Button from '../common/Button';
import Deposit from '../pool/Deposit';
import { ArrowCircleDownIcon } from '@heroicons/react/solid';
import usePools from '../../hooks/protocol/usePools';
import PoolSelect from '../pool/PoolSelect';
import { IAsset, IPool } from '../../lib/protocol/types';
import useConnector from '../../hooks/useConnector';
import InterestRateInput from './InterestRateInput';

const BorderWrap = tw.div`mx-auto max-w-md p-2 border border-secondary-400 shadow-sm rounded-lg bg-gray-800`;
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
}

const INITIAL_FORM_STATE: ITradeForm = {
  pool: undefined,
  fromAsset: undefined,
  fromAmount: '',
  toAsset: undefined,
  toAmount: '',
  interestRate: '',
};

const TradeWidget = () => {
  const { chainId, account } = useConnector();
  const { data: pools, loading } = usePools();

  const [form, setForm] = useState<ITradeForm>(INITIAL_FORM_STATE);
  const [updatingFromAmount, setUpdatingFromAmount] = useState<boolean>(false);
  const [updatingToAmount, setUpdatingToAmount] = useState<boolean>(false);

  const handleClearAll = () => setForm(INITIAL_FORM_STATE);
  const handleToggleDirection = () => setForm((f) => ({ ...f, fromAsset: f.toAsset, toAsset: f.fromAsset }));
  const handleSubmit = () => {
    console.log('submitting trade with details', form);
  };

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
        fromAmount: '',
        toAsset: f.pool?.fyToken,
        toAmount: '',
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
          <Deposit
            amount={fromAmount}
            balance={fromAsset?.balance_!}
            asset={fromAsset}
            setAmount={(amount: string) => setForm((f) => ({ ...f, fromAmount: amount }))}
            disabled={updatingToAmount && pool}
          />
          <ArrowCircleDownIcon
            className="justify-self-center text-gray-400 hover:border hover:border-secondary-500 rounded-full hover:cursor-pointer"
            height={27}
            width={27}
            onClick={handleToggleDirection}
          />
          <Deposit
            amount={toAmount}
            balance={toAsset?.balance_!}
            asset={toAsset}
            setAmount={(amount: string) => setForm((f) => ({ ...f, toAmount: amount }))}
            disabled={updatingFromAmount && pool}
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
