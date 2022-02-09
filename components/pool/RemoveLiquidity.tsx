import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import BackButton from '../common/BackButton';
import Button from '../common/Button';
import InputWrap from './InputWrap';
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

interface IRemoveLiquidityForm {
  pool: IPool | undefined;
  lpTokens: string;
}

const INITIAL_FORM_STATE: IRemoveLiquidityForm = {
  pool: undefined,
  lpTokens: '',
};

const RemoveLiquidity = () => {
  const router = useRouter();
  const { chainId, account } = useConnector();
  const { data: pools } = usePools();

  const [form, setForm] = useState<IRemoveLiquidityForm>(INITIAL_FORM_STATE);

  const handleClearAll = () => {
    setForm(INITIAL_FORM_STATE);
  };

  const handleInputChange = (name: string, value: string) => setForm((f) => ({ ...f, [name]: value }));

  // reset chosen pool when chainId changes
  useEffect(() => {
    setForm((f) => ({ ...f, pool: undefined }));
  }, [chainId]);

  const { pool, lpTokens } = form;

  return (
    <BorderWrap>
      <Inner>
        <TopRow>
          <BackButton onClick={() => router.back()} />
          <Header>
            <HeaderText>Remove Liquidity</HeaderText>
          </Header>
          <ClearButton onClick={handleClearAll}>Clear All</ClearButton>
        </TopRow>

        <Grid>
          <PoolSelect pools={pools} pool={pool} setPool={(p) => setForm((f) => ({ ...f, pool: p }))} />
        </Grid>

        <Grid>
          <HeaderSmall>Remove LP Tokens</HeaderSmall>
          <InputWrap
            name="lpTokens"
            value={lpTokens}
            asset={pool?.base}
            balance={pool?.lpTokenBalance_!}
            handleChange={handleInputChange}
          />
        </Grid>
        <Button action={() => console.log('updating liq')} disabled={!account}>
          {!account ? 'Connect Wallet' : 'Remove Liquidity'}
        </Button>
      </Inner>
    </BorderWrap>
  );
};

export default RemoveLiquidity;
