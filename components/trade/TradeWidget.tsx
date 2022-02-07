import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import Button from '../common/Button';
import Deposit from '../pool/Deposit';
import { ArrowCircleDownIcon } from '@heroicons/react/solid';
import usePools from '../../hooks/protocol/usePools';
import PoolSelect from '../pool/PoolSelect';
import { IAsset, IPool } from '../../lib/protocol/types';
import useConnector from '../../hooks/useConnector';

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
  fromAmount: string | undefined;
  toAsset: IAsset | undefined;
  toAmount: string | undefined;
}

const INITIAL_FORM_STATE: ITradeForm = {
  pool: undefined,
  fromAsset: undefined,
  fromAmount: undefined,
  toAsset: undefined,
  toAmount: undefined,
};

const TradeWidget = () => {
  const { chainId, account } = useConnector();
  const { data: pools, loading } = usePools();
  console.log('🦄 ~ file: TradeWidget.tsx ~ line 39 ~ TradeWidget ~ pools', pools);
  const [toggleDirection, setToggleDirection] = useState<boolean>(true);

  const [form, setForm] = useState<ITradeForm>(INITIAL_FORM_STATE);

  const handleClearAll = () => setForm(INITIAL_FORM_STATE);

  const handleToggleTradeDirection = () => {
    setToggleDirection(!toggleDirection);
    setForm((f) => ({ ...f, fromAsset: f.toAsset, toAsset: f.fromAsset }));
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
        fromAsset: f.pool.base,
        fromAmount: undefined,
        toAsset: f.pool.fyToken,
        toAmount: undefined,
      }));
  }, [form.pool]);

  const { pool, fromAsset, fromAmount, toAsset, toAmount } = form;

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
        </Grid>

        <Grid>
          <Deposit
            amount={fromAmount!}
            asset={fromAsset}
            setAmount={(amount: string) => setForm((f) => ({ ...f, baseAmount: amount }))}
          />
          <ArrowCircleDownIcon
            className="justify-self-center text-gray-400 hover:border hover:border-secondary-500 rounded-full hover:cursor-pointer"
            height={27}
            width={27}
            onClick={handleToggleTradeDirection}
          />
          <Deposit
            amount={toAmount!}
            asset={toAsset}
            setAmount={(amount: string) => setForm((f) => ({ ...f, fyTokenAmount: amount }))}
          />
        </Grid>
        <div className="py-1">
          <div className="my-2 h-20 flex items-center text-lg border border-gray-700 rounded-md">
            <span className="mx-auto">some data once the inputs are selected</span>
          </div>
        </div>
        <Button action={() => console.log('trading')} disabled={!account}>
          {!account ? 'Connect Wallet' : 'Trade'}
        </Button>
      </Inner>
    </BorderWrap>
  );
};

export default TradeWidget;
