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
import Modal from '../common/Modal';
import CloseButton from '../common/CloseButton';
import RemoveConfirmation from './RemoveConfirmation';

const Inner = tw.div`m-4 text-center`;
const HeaderSmall = tw.div`align-middle text-sm font-bold justify-start text-left`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

export interface IRemoveLiquidityForm {
  pool: IPool | undefined;
  lpTokens: string;
  method: RemoveLiquidityActions;
  description: string;
}

const INITIAL_FORM_STATE: IRemoveLiquidityForm = {
  pool: undefined,
  lpTokens: '',
  method: RemoveLiquidityActions.BURN_FOR_BASE,
  description: '',
};

const RemoveLiquidity = () => {
  const router = useRouter();
  const { address } = router.query;
  const { chainId, account } = useConnector();
  const { data: pools, loading } = usePools();

  const [form, setForm] = useState<IRemoveLiquidityForm>(INITIAL_FORM_STATE);
  const { pool, lpTokens, method, description } = form;

  const [burnForBase, setBurnForBase] = useState<boolean>(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);

  const { removeLiquidity, isRemovingLiq } = useRemoveLiquidity(pool!);

  const handleMaxLpTokens = () => {
    setForm((f) => ({ ...f, lpTokens: pool?.lpTokenBalance_! }));
  };

  const handleClearAll = () => {
    setForm(INITIAL_FORM_STATE);
  };

  const handleSubmit = () => {
    setConfirmModalOpen(true);
  };

  const handleInputChange = (name: string, value: string) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  // reset chosen pool when chainId changes
  useEffect(() => {
    setForm((f) => ({ ...f, pool: undefined }));
  }, [chainId]);

  // use pool address from router query if available
  useEffect(() => {
    pools && setForm((f) => ({ ...f, pool: pools![address as string] }));
  }, [pools, address]);

  // set remove liquidity description to use in useRemoveLiquidity hook
  useEffect(() => {
    const _description = `Removing ${lpTokens} lp tokens${
      method! === RemoveLiquidityActions.BURN_FOR_BASE ? ` and receiving all base` : ' receiving both base and fyTokens'
    }`;
    setForm((f) => ({ ...f, description: _description }));
  }, [lpTokens, method]);

  // update method in form based on burnForBase toggle
  useEffect(() => {
    setForm((f) => ({
      ...f,
      method: burnForBase ? RemoveLiquidityActions.BURN_FOR_BASE : RemoveLiquidityActions.BURN,
    }));
  }, [pool, burnForBase]);

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
            pool={pool!}
          />

          {pool && (
            <Toggle
              enabled={burnForBase}
              setEnabled={setBurnForBase}
              label={
                burnForBase
                  ? `Receive all ${pool?.base?.symbol}`
                  : `Receive both ${pool?.base?.symbol} and fy${pool?.base?.symbol}`
              }
            />
          )}
        </Grid>
        <Button action={handleSubmit} disabled={!account || !pool || !lpTokens || isRemovingLiq}>
          {!account ? 'Connect Wallet' : isRemovingLiq ? 'Remove Liquidity Initiated...' : 'Remove Liquidity'}
        </Button>
        {confirmModalOpen && (
          <Modal isOpen={confirmModalOpen} setIsOpen={setConfirmModalOpen}>
            <TopRow>
              <Header>Confirm Remove Liquidity</Header>
              <CloseButton action={() => setConfirmModalOpen(false)} height="1.2rem" width="1.2rem" />
            </TopRow>
            <RemoveConfirmation
              form={form}
              action={() => removeLiquidity(lpTokens, method, description)}
              disabled={isRemovingLiq}
              loading={isRemovingLiq}
            />
          </Modal>
        )}
      </Inner>
    </BorderWrap>
  );
};

export default RemoveLiquidity;
