import tw from 'tailwind-styled-components';
import AssetSelect from '../common/AssetSelect';
import { IAsset, IPool } from '../../lib/protocol/types';
import Button from '../common/Button';
import InfoIcon from '../common/InfoIcon';
import { PlusIcon } from '@heroicons/react/solid';
import { IRemoveLiquidityForm } from './RemoveLiquidity';

const Container = tw.div`relative flex justify-center items-center w-full`;
const Wrap = tw.div`w-full text-center text-lg align-middle items-center`;
const InputStyleContainer = tw.div`flex rounded-md justify-between p-1 w-full gap-5 align-middle border dark:border-gray-800 dark:bg-gray-800 bg-gray-300 border-gray-300`;
const InputsOuter = tw.div`flex items-center justify-center relative w-full`;
const InputStyle = tw.div`h-full caret-gray-800 dark:caret-gray-50 text-2xl appearance-none w-full dark:bg-gray-800 bg-gray-300 dark:focus:text-gray-50 focus:text-gray-800 dark:text-gray-300 text-gray-800 py-1 px-4 leading-tight focus:outline-none `;
const InputInner = tw.div`w-auto ml-3 text-center text-lg align-middle my-1 items-center`;
const AssetSelectOuter = tw.div`min-w-fit dark:text-gray-50`;
const AssetSelectWrap = tw.div`p-1`;
const InputsWrap = tw.div`w-full flex flex-col gap-1 my-5`;
const DetailsWrap = tw.div`grid w-full p-2 gap-2`;
const DetailWrap = tw.div`justify-between flex`;
const Detail = tw.div`text-sm dark:text-gray-50`;
const DetailGray = tw.div`italic text-gray-300 text-sm`;
const Italic = tw.div`italic text-xs text-gray-300 my-3`;

interface IRemoveConfirmation {
  form: IRemoveLiquidityForm;
  action: any;
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
  const { pool, lpTokens } = form;
  const output = 'some';

  return (
    <Container>
      <Wrap>
        <InputsOuter>
          <InputsWrap>
            <ConfirmItem value={lpTokens} pool={pool!} />
          </InputsWrap>
        </InputsOuter>
        <InputStyleContainer>
          <DetailsWrap>
            <DetailWrap>
              <Detail>Expected output</Detail>
              <Detail>{output} base or base + fyToken</Detail>
            </DetailWrap>
            <div className="w-full h-[1px] bg-gray-700" />
            <DetailWrap>
              <DetailGray>Minimum received after slippage</DetailGray>
              <DetailGray>{output} base or base + fyToken</DetailGray>
            </DetailWrap>
          </DetailsWrap>
        </InputStyleContainer>
        <Italic>Output is estimated.</Italic>
        <Button action={action} disabled={disabled} loading={loading}>
          {loading ? 'Remove Liquidity Initiated...' : 'Confirm Remove Liquidity'}
        </Button>
      </Wrap>
    </Container>
  );
};

export default RemoveConfirmation;