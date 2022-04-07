import tw from 'tailwind-styled-components';
import AssetSelect from '../common/AssetSelect';
import { IPool } from '../../lib/protocol/types';
import Button from '../common/Button';
import { IRemoveLiquidityForm } from './RemoveLiquidity';
import useRemoveLiqPreview from '../../hooks/protocol/useRemoveLiqPreview';
import { cleanValue, valueAtDigits } from '../../utils/appUtils';
import { Container, InputsWrap } from '../styles/confirm';

const InputStyleContainer = tw.div`flex rounded-md justify-between p-1 w-full gap-2 align-middle border dark:border-gray-800 dark:bg-gray-800 bg-gray-300 border-gray-300 items-center`;
const InputStyle = tw.div`h-full caret-gray-800 dark:caret-gray-50 text-2xl appearance-none w-full dark:bg-gray-800 bg-gray-300 dark:focus:text-gray-50 focus:text-gray-800 dark:text-gray-300 text-gray-800 py-1 px-2 leading-tight focus:outline-none `;
const InputInner = tw.div`w-auto ml-3 text-center text-lg align-middle my-1 items-center`;
const AssetSelectOuter = tw.div`min-w-fit dark:text-gray-50`;
const AssetSelectWrap = tw.div`p-1`;
const DetailsWrap = tw.div`grid w-full p-2 gap-2`;
const DetailWrap = tw.div`justify-between flex`;
const Detail = tw.div`text-sm dark:text-gray-50 text-gray-900`;
const Italic = tw.div`text-center italic text-xs dark:text-gray-300 text-gray-800 my-3`;

interface IRemoveConfirmation {
  form: IRemoveLiquidityForm;
  action: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const ConfirmItem = ({ value, pool }: { value: string; pool: IPool }) => (
  <InputStyleContainer>
    <InputInner>
      <InputStyle>{value}</InputStyle>
    </InputInner>
    <AssetSelectOuter>
      <AssetSelectWrap>
        <AssetSelect item={pool} pool={pool} isFyToken={true} />
      </AssetSelectWrap>
    </AssetSelectOuter>
  </InputStyleContainer>
);

const RemoveConfirmation = ({ form, action, disabled, loading }: IRemoveConfirmation) => {
  const { pool, lpTokens, method } = form;
  const { baseReceived, fyTokenReceived } = useRemoveLiqPreview(pool!, lpTokens, method!);

  return (
    <Container>
      <InputsWrap>
        <ConfirmItem value={valueAtDigits(lpTokens, 4)} pool={pool!} />
      </InputsWrap>
      <InputStyleContainer>
        <DetailsWrap>
          <DetailWrap>
            <Detail>Estimated {pool?.base.symbol} Received</Detail>
            <Detail>{cleanValue(baseReceived, pool?.base.digitFormat)}</Detail>
          </DetailWrap>
          {fyTokenReceived && (
            <DetailWrap>
              <Detail>Estimated {pool?.fyToken.symbol} Received</Detail>
              <Detail>{cleanValue(fyTokenReceived, pool?.fyToken.digitFormat)}</Detail>
            </DetailWrap>
          )}
        </DetailsWrap>
      </InputStyleContainer>
      <Italic>Output is estimated.</Italic>
      <Button action={action} disabled={disabled} loading={loading}>
        {loading ? 'Remove Liquidity Initiated...' : 'Confirm Remove Liquidity'}
      </Button>
    </Container>
  );
};

export default RemoveConfirmation;
