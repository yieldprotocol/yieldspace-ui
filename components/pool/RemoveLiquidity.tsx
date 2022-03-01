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
import { BorderWrap, Header } from '../styles/';
import { useRemoveLiquidity } from '../../hooks/protocol/useRemoveLiquidity';
import { RemoveLiquidityActions } from '../../lib/protocol/liquidity/types';
import Toggle from '../common/Toggle';

const Inner = tw.div`m-4 text-center`;
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
  const { address } = router.query;
  const { chainId, account } = useConnector();
  const { data: pools, loading } = usePools();

  const [form, setForm] = useState<IRemoveLiquidityForm>(INITIAL_FORM_STATE);
  const [burnForBase, setBurnForBase] = useState<boolean>(true);
  const { pool, lpTokens } = form;

  const { removeLiquidity, isRemovingLiq } = useRemoveLiquidity(pool!);

  const handleMaxLpTokens = () => {
    setForm((f) => ({ ...f, lpTokens: pool?.lpTokenBalance_ }));
  };

  const handleClearAll = () => {
    setForm(INITIAL_FORM_STATE);
  };

  const handleSubmit = () => {
    const description = `Removing ${lpTokens} lp tokens${
      burnForBase ? ` and receiving all base` : ' receiving both base and fyTokens'
    }`;

    pool &&
      removeLiquidity(
        lpTokens,
        burnForBase ? RemoveLiquidityActions.BURN_FOR_BASE : RemoveLiquidityActions.BURN,
        description
      );
  };

  const handleInputChange = (name: string, value: string) => setForm((f) => ({ ...f, [name]: value }));

  // reset chosen pool when chainId changes
  useEffect(() => {
    setForm((f) => ({ ...f, pool: undefined }));
  }, [chainId]);

  // use pool address from router query if avaialable
  useEffect(() => {
    pools && setForm((f) => ({ ...f, pool: pools![address as string] }));
  }, [pools, address]);

  return (
    <BorderWrap>
      <Inner>
        <TopRow>
          <BackButton onClick={() => router.back()} />
          <Header>Remove Liquidity</Header>
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
          <HeaderSmall>Remove LP Tokens</HeaderSmall>
          <InputWrap
            name="lpTokens"
            value={lpTokens}
            item={pool}
            balance={pool?.lpTokenBalance_!}
            handleChange={handleInputChange}
            useMax={handleMaxLpTokens}
          />

          <Toggle
            enabled={burnForBase}
            setEnabled={setBurnForBase}
            label={
              burnForBase
                ? `Receive all ${pool?.base.symbol}`
                : `Receive both ${pool?.base.symbol} and fy${pool?.base.symbol}`
            }
          />
        </Grid>
        <Button action={handleSubmit} disabled={!account || !pool || !lpTokens || isRemovingLiq}>
          {isRemovingLiq ? 'Removing Liquidity' : !account ? 'Connect Wallet' : 'Remove Liquidity'}
        </Button>
      </Inner>
    </BorderWrap>
  );
};

export default RemoveLiquidity;
