import tw from 'tailwind-styled-components';
import AssetSelect from '../common/AssetSelect';
import { IAsset, IPool } from '../../lib/protocol/types';
import Button from '../common/Button';
import useTimeTillMaturity from '../../hooks/useTimeTillMaturity';
import InfoIcon from '../common/InfoIcon';
import { PlusIcon } from '@heroicons/react/solid';
import { IAddLiquidityForm } from './AddLiquidity';

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

interface IAddConfirmation {
  form: IAddLiquidityForm;
  action: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const ConfirmItem = ({ value, asset, pool }: { value: string; asset: IAsset; pool: IPool }) => (
  <InputStyleContainer>
    <InputInner>
      <InputStyle>{value}</InputStyle>
    </InputInner>
    <AssetSelectOuter>
      <AssetSelectWrap>
        <AssetSelect item={asset} isFyToken={asset.symbol.includes('FY') || false} pool={pool} />
      </AssetSelectWrap>
    </AssetSelectOuter>
  </InputStyleContainer>
);

const AddConfirmation = ({ form, action, disabled, loading }: IAddConfirmation) => {
  const { pool, baseAmount, fyTokenAmount } = form;
  const timeTillMaturity_ = useTimeTillMaturity(pool?.maturity!);
  const output = 'some';

  return (
    <Container>
      <Wrap>
        <InputsOuter>
          <InputsWrap>
            <ConfirmItem value={baseAmount} asset={pool?.base!} pool={pool!} />
            {fyTokenAmount !== '' && +fyTokenAmount !== 0 && (
              <>
                <PlusIcon className="w-full justify-self-center dark:text-gray-50" height={20} width={20} />
                <ConfirmItem value={fyTokenAmount} asset={pool?.fyToken!} pool={pool!} />
              </>
            )}
          </InputsWrap>
        </InputsOuter>
        <InputStyleContainer>
          <DetailsWrap>
            <DetailWrap>
              <Detail>Maturity</Detail>
              <div className="text-sm dark:text-gray-50">
                <div className="flex justify-end">{pool?.displayName}</div>
                <div className="italic text-xs dark:text-gray-300">{timeTillMaturity_} until maturity</div>
              </div>
            </DetailWrap>
            <DetailWrap>
              <Detail>Expected output</Detail>
              <Detail>{output} LP Tokens</Detail>
            </DetailWrap>
            <div className="w-full h-[1px] bg-gray-700" />
            <DetailWrap>
              <DetailGray>Minimum received after slippage</DetailGray>
              <DetailGray>{output} LP Tokens</DetailGray>
            </DetailWrap>
          </DetailsWrap>
        </InputStyleContainer>
        <Italic>Output is estimated.</Italic>
        <Button action={action} disabled={disabled} loading={loading}>
          {loading ? 'Trade Initiated...' : 'Confirm Trade'}
        </Button>
      </Wrap>
    </Container>
  );
};

export default AddConfirmation;