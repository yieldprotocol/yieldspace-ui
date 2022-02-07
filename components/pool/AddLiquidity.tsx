import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import BackButton from '../common/BackButton';
import Button from '../common/Button';
import Deposit from './Deposit';
import { PlusIcon } from '@heroicons/react/solid';
import Toggle from '../common/Toggle';
import usePools from '../../hooks/protocol/usePools';
import PoolSelect from './PoolSelect';
import { IPool } from '../../lib/protocol/types';
import useConnector from '../../hooks/useConnector';

const BorderWrap = tw.div`mx-auto max-w-md p-2 border border-secondary-400 shadow-sm rounded-lg bg-gray-800`;
const Inner = tw.div`m-4 text-center`;
const Header = tw.div`text-lg font-bold justify-items-start align-middle`;
const HeaderText = tw.span`align-middle`;
const HeaderSmall = tw.div`align-middle text-sm font-bold justify-start text-left`;

const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

interface IAddLiquidityForm {
  pool: IPool | undefined;
  baseAmount: string;
  fyTokenAmount: string;
}

const INITIAL_FORM_STATE: IAddLiquidityForm = {
  pool: undefined,
  baseAmount: '',
  fyTokenAmount: '',
};

const AddLiquidity = () => {
  const router = useRouter();
  const { chainId, account } = useConnector();
  const { data: pools } = usePools();

  const [form, setForm] = useState<IAddLiquidityForm>(INITIAL_FORM_STATE);

  const [useFyTokenBalance, toggleUseFyTokenBalance] = useState<boolean>(false);

  const handleClearAll = () => {
    setForm(INITIAL_FORM_STATE);
  };

  // reset chosen pool when chainId changes
  useEffect(() => {
    setForm((f) => ({ ...f, pool: undefined }));
  }, [chainId]);

  const { pool, baseAmount, fyTokenAmount } = form;

  return (
    <BorderWrap>
      <Inner>
        <TopRow>
          <BackButton onClick={() => router.back()} />
          <Header>
            <HeaderText>Add Liquidity</HeaderText>
          </Header>
          <ClearButton onClick={handleClearAll}>Clear All</ClearButton>
        </TopRow>

        <Grid>
          <PoolSelect pools={pools} pool={pool} setPool={(p) => setForm((f) => ({ ...f, pool: p }))} />
        </Grid>

        <Grid>
          <HeaderSmall>Deposit Amounts</HeaderSmall>
          <Deposit
            amount={baseAmount}
            balance={pool?.base.balance_!}
            asset={pool?.base}
            setAmount={(amount: string) => setForm((f) => ({ ...f, baseAmount: amount }))}
          />

          <PlusIcon className="justify-self-center" height={20} width={20} />

          <Toggle enabled={useFyTokenBalance} setEnabled={toggleUseFyTokenBalance} label="Use fyToken Balance" />
          <Deposit
            amount={fyTokenAmount}
            balance={pool?.fyToken.balance_!}
            asset={pool?.fyToken}
            setAmount={(amount: string) => setForm((f) => ({ ...f, fyTokenAmount: amount }))}
          />
        </Grid>
        <div className="py-1">
          <div className="my-2 h-20 flex items-center text-lg border border-gray-700 rounded-md">
            <span className="mx-auto">lp tokens out and other data</span>
          </div>
        </div>
        <Button action={() => console.log('adding liq')} disabled={!account}>
          {!account ? 'Connect Wallet' : 'Add Liquidity'}
        </Button>
      </Inner>
    </BorderWrap>
  );
};

export default AddLiquidity;
