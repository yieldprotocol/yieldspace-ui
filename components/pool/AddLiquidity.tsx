import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import BackButton from '../common/BackButton';
import Button from '../common/Button';
import InputWrap from './InputWrap';
import Toggle from '../common/Toggle';
import usePools from '../../hooks/protocol/usePools';
import PoolSelect from './PoolSelect';
import { IPool } from '../../lib/protocol/types';
import useConnector from '../../hooks/useConnector';
import { BorderWrap, Header } from '../styles/';
import { useAddLiquidity } from '../../hooks/protocol/useAddLiquidity';
import Modal from '../common/Modal';
import AddConfirmation from './AddConfirmation';
import CloseButton from '../common/CloseButton';
import { AddLiquidityActions } from '../../lib/protocol/liquidity/types';
import Arrow from '../trade/Arrow';
import InputsWrap from '../styles/InputsWrap';
import useInputValidation from '../../hooks/useInputValidation';

const Inner = tw.div`m-4 text-center`;
const HeaderSmall = tw.div`align-middle text-sm font-bold justify-start text-left`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

export interface IAddLiquidityForm {
  pool: IPool | undefined;
  baseAmount: string;
  fyTokenAmount: string;
  method: AddLiquidityActions;
  description: string;
  useFyToken: boolean;
}

const INITIAL_FORM_STATE: IAddLiquidityForm = {
  pool: undefined,
  baseAmount: '',
  fyTokenAmount: '',
  method: AddLiquidityActions.MINT_WITH_BASE,
  description: '',
  useFyToken: false,
};

const AddLiquidity = () => {
  const router = useRouter();
  const { address } = router.query;
  const { chainId, account } = useConnector();
  const { data: pools } = usePools();

  const [form, setForm] = useState<IAddLiquidityForm>(INITIAL_FORM_STATE);
  const { pool, baseAmount, fyTokenAmount, method, description, useFyToken } = form;
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [useFyTokenToggle, setUseFyTokenToggle] = useState<boolean>(false);

  const { errorMsg } = useInputValidation(baseAmount, pool, [], method!);
  const { addLiquidity, isAddingLiquidity, addSubmitted } = useAddLiquidity(pool!, baseAmount, method, description);

  const handleMaxBase = () => {
    setForm((f) => ({ ...f, baseAmount: pool?.base.balance_!, fyTokenAmount: pool?.base.balance_! }));
  };

  const handleClearAll = () => {
    address ? setForm((f) => ({ ...f, baseAmount: '', fyTokenAmount: '' })) : setForm(INITIAL_FORM_STATE);
  };

  const handleSubmit = () => {
    setConfirmModalOpen(true);
  };

  const handleInputChange = (name: string, value: string) => {
    setForm((f) => ({ ...f, [name]: value, fyTokenAmount: value }));
  };

  // reset chosen pool when chainId changes
  useEffect(() => {
    setForm((f) => ({ ...f, pool: undefined }));
  }, [chainId]);

  // use pool address from router query if available
  useEffect(() => {
    pools && setForm((f) => ({ ...f, pool: pools![address as string] }));
  }, [pools, address]);

  // set add liquidity description to use in useAddLiquidity hook
  useEffect(() => {
    const _description = `Add ${baseAmount} ${pool?.base.symbol}${
      +fyTokenAmount > 0 && useFyToken ? ` and ${fyTokenAmount} ${pool?.fyToken.symbol}` : ''
    }`;
    setForm((f) => ({ ...f, description: _description }));
  }, [pool?.base.symbol, baseAmount, useFyToken, fyTokenAmount, pool?.fyToken.symbol]);

  // set add liquidity method when useFyTokenBalance changes
  useEffect(() => {
    setForm((f) => ({
      ...f,
      method: useFyToken ? AddLiquidityActions.MINT : AddLiquidityActions.MINT_WITH_BASE,
    }));
  }, [useFyToken]);

  // close modal when the adding liquidity was successfullly submitted (user took all actions to get tx through)
  useEffect(() => {
    if (addSubmitted) {
      setConfirmModalOpen(false);
      setForm((f) => ({ ...f, baseAmount: '', fyTokenAmount: '' }));
    }
  }, [addSubmitted]);

  // update form when toggling useFyTokenToggle
  useEffect(() => {
    setForm((f) => ({ ...f, useFyToken: useFyTokenToggle }));
  }, [useFyTokenToggle]);

  // update the form's pool whenever the pool changes (i.e. when the user interacts and balances change)
  useEffect(() => {
    const _pool = pools && pool?.address! in pools ? pools[pool?.address!] : undefined;
    if (_pool) {
      setForm((f) => ({ ...f, pool: _pool }));
    }
  }, [pools, pool]);

  return (
    <BorderWrap>
      <Inner>
        <TopRow>
          <BackButton onClick={() => router.back()} />
          <Header>Add Liquidity</Header>
          <ClearButton onClick={handleClearAll}>Clear All</ClearButton>
        </TopRow>

        <Grid>
          <PoolSelect
            pool={pool}
            pools={address ? undefined : pools}
            setPool={(p: IPool) => setForm((f) => ({ ...f, pool: p }))}
          />
        </Grid>

        <Grid>
          <HeaderSmall>Deposit Amounts</HeaderSmall>
          <InputsWrap>
            <InputWrap
              name="baseAmount"
              value={baseAmount}
              item={pool?.base}
              balance={pool?.base.balance_!}
              handleChange={handleInputChange}
              useMax={handleMaxBase}
              pool={pool}
            />
            {useFyToken && <Arrow isPlusIcon={true} />}
            {useFyToken && (
              <InputWrap
                name="fyTokenAmount"
                value={fyTokenAmount}
                item={pool?.fyToken}
                balance={pool?.fyToken.balance_!}
                handleChange={handleInputChange}
                unFocused={true}
                disabled
                pool={pool}
              />
            )}
          </InputsWrap>
          <Toggle enabled={useFyToken} setEnabled={setUseFyTokenToggle} label="Use fyToken Balance" />
        </Grid>
        <Button
          action={handleSubmit}
          disabled={!account || !pool || !baseAmount || isAddingLiquidity || !!errorMsg}
          loading={isAddingLiquidity}
        >
          {!account
            ? 'Connect Wallet'
            : isAddingLiquidity
            ? 'Add Liquidity Initiated...'
            : errorMsg
            ? errorMsg
            : 'Add Liquidity'}
        </Button>
        {confirmModalOpen && pool && (
          <Modal isOpen={confirmModalOpen} setIsOpen={setConfirmModalOpen}>
            <TopRow>
              <Header>Confirm Add Liquidity</Header>
              <CloseButton action={() => setConfirmModalOpen(false)} height="1.2rem" width="1.2rem" />
            </TopRow>
            <AddConfirmation
              form={form}
              action={addLiquidity}
              disabled={!account || !pool || !baseAmount || isAddingLiquidity}
              loading={isAddingLiquidity}
            />
          </Modal>
        )}
      </Inner>
    </BorderWrap>
  );
};

export default AddLiquidity;
