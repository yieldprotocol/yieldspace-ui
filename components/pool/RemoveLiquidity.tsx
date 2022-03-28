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
import useInputValidation from '../../hooks/useInputValidation';

const Inner = tw.div`m-4 text-center`;
const HeaderSmall = tw.div`align-middle text-sm font-bold justify-start text-left`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

export interface IRemoveLiquidityForm {
  pool: IPool | undefined;
  lpTokens: string;
  method: RemoveLiquidityActions;
}

const INITIAL_FORM_STATE: IRemoveLiquidityForm = {
  pool: undefined,
  lpTokens: '',
  method: RemoveLiquidityActions.BURN_FOR_BASE,
};

const RemoveLiquidity = () => {
  const router = useRouter();
  const { address } = router.query;
  const { chainId, account } = useConnector();
  const { data: pools } = usePools();

  const [form, setForm] = useState<IRemoveLiquidityForm>(INITIAL_FORM_STATE);
  const { pool, lpTokens, method } = form;

  const [burnForBase, setBurnForBase] = useState<boolean>(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);

  const { errorMsg } = useInputValidation(lpTokens, pool, [0, lpTokens], method);
  const description = `Remove ${lpTokens} LP tokens${
    method! === RemoveLiquidityActions.BURN_FOR_BASE
      ? ` and receive all ${pool?.base.symbol}`
      : ` receive both ${pool?.base.symbol} and ${pool?.fyToken.symbol}`
  }`;
  const { removeLiquidity, isRemovingLiq, removeSubmitted } = useRemoveLiquidity(pool!, lpTokens, method, description);

  const handleMaxLpTokens = () => {
    setForm((f) => ({ ...f, lpTokens: pool?.lpTokenBalance_! }));
  };

  const handleClearAll = () => {
    address ? setForm((f) => ({ ...f, lpTokens: '' })) : setForm(INITIAL_FORM_STATE);
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

  // update method in form based on burnForBase toggle
  useEffect(() => {
    setForm((f) => ({
      ...f,
      method: burnForBase ? RemoveLiquidityActions.BURN_FOR_BASE : RemoveLiquidityActions.BURN,
    }));
  }, [pool, burnForBase]);

  // update the form's pool whenever the pool changes (i.e. when the user interacts and balances change)
  useEffect(() => {
    const _pool = pools && pool?.address! in pools ? pools[pool?.address!] : undefined;
    if (_pool) {
      setForm((f) => ({ ...f, pool: _pool }));
    }
  }, [pools, pool]);

  // close modal when the adding liquidity was successfullly submitted (user took all actions to get tx through)
  useEffect(() => {
    if (removeSubmitted) {
      setConfirmModalOpen(false);
      setForm((f) => ({ ...f, lpTokens: '' }));
    }
  }, [removeSubmitted]);

  return (
    <BorderWrap>
      <Inner>
        <TopRow>
          <BackButton onClick={() => router.back()} />
          <Header>Remove Liquidity</Header>
          <ClearButton onClick={handleClearAll}>Clear All</ClearButton>
        </TopRow>

        <Grid>
          <PoolSelect pool={pool} />
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

          {pool && !pool.isMature && (
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
        <Button action={handleSubmit} disabled={!account || !pool || !lpTokens || isRemovingLiq || !!errorMsg}>
          {!account
            ? 'Connect Wallet'
            : isRemovingLiq
            ? 'Remove Liquidity Initiated...'
            : errorMsg
            ? errorMsg
            : 'Remove Liquidity'}
        </Button>
        {confirmModalOpen && pool && (
          <Modal isOpen={confirmModalOpen} setIsOpen={setConfirmModalOpen} styleProps="p-5">
            <TopRow>
              <Header>Confirm Remove Liquidity</Header>
              <CloseButton action={() => setConfirmModalOpen(false)} height="1.2rem" width="1.2rem" />
            </TopRow>
            <RemoveConfirmation
              form={form}
              action={removeLiquidity}
              disabled={!account || !pool || !lpTokens || isRemovingLiq}
              loading={isRemovingLiq}
            />
          </Modal>
        )}
      </Inner>
    </BorderWrap>
  );
};

export default RemoveLiquidity;
