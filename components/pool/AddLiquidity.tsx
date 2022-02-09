import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import BackButton from '../common/BackButton';
import Button from '../common/Button';
import InputWrap from './InputWrap';
import { PlusIcon } from '@heroicons/react/solid';
import Toggle from '../common/Toggle';
import usePools from '../../hooks/protocol/usePools';
import PoolSelect from './PoolSelect';
import { IPool } from '../../lib/protocol/types';
import useConnector from '../../hooks/useConnector';

const BorderWrap = tw.div`mx-auto max-w-md p-2 border border-secondary-400 shadow-sm rounded-lg dark:bg-gray-800 bg-gray-200`;
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

  const handleSubmit = () => {
    console.log('submitting with data:', form);
  };

  const handleInputChange = (name: string, value: string) => setForm((f) => ({ ...f, [name]: value }));

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
          <InputWrap
            name="baseAmount"
            value={baseAmount}
            asset={pool?.base}
            balance={pool?.base.balance_!}
            handleChange={handleInputChange}
          />

          {useFyTokenBalance && <PlusIcon className="justify-self-center" height={20} width={20} />}

          <Toggle enabled={useFyTokenBalance} setEnabled={toggleUseFyTokenBalance} label="Use fyToken Balance" />

          {useFyTokenBalance && (
            <InputWrap
              name="fyTokenAmount"
              value={fyTokenAmount}
              asset={pool?.fyToken}
              balance={pool?.fyToken.balance_!}
              handleChange={handleInputChange}
            />
          )}
        </Grid>
        <Button action={handleSubmit} disabled={!account}>
          {!account ? 'Connect Wallet' : 'Add Liquidity'}
        </Button>
      </Inner>
    </BorderWrap>
  );
};

export default AddLiquidity;
