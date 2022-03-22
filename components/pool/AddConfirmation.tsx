import tw from 'tailwind-styled-components';
import AssetSelect from '../common/AssetSelect';
import { IAsset, IPool } from '../../lib/protocol/types';
import Button from '../common/Button';
import useTimeTillMaturity from '../../hooks/useTimeTillMaturity';
import { IAddLiquidityForm } from './AddLiquidity';
import Arrow from '../trade/Arrow';
import useAddLiquidityPreview from '../../hooks/protocol/useAddLiqPreview';

const Container = tw.div`relative flex justify-center items-center w-full`;
const Wrap = tw.div`w-full text-center text-lg align-middle items-center`;
const InputStyleContainer = tw.div`flex rounded-md justify-between p-1 w-full gap-5 align-middle border dark:border-gray-800 dark:bg-gray-800 bg-gray-300 border-gray-300 items-center`;
const InputsOuter = tw.div`flex items-center justify-center relative w-full`;
const InputStyle = tw.div`h-full caret-gray-800 dark:caret-gray-50 text-2xl appearance-none w-full dark:bg-gray-800 bg-gray-300 dark:focus:text-gray-50 focus:text-gray-800 dark:text-gray-300 text-gray-800 py-1 px-4 leading-tight focus:outline-none items-center`;
const InputInner = tw.div`w-auto ml-3 text-center text-lg align-middle my-1 items-center`;
const AssetSelectOuter = tw.div`min-w-fit dark:text-gray-50`;
const AssetSelectWrap = tw.div`p-1`;
const InputsWrap = tw.div`w-full flex flex-col gap-1 my-5`;
const DetailsWrap = tw.div`grid w-full p-2 gap-2`;
const DetailWrap = tw.div`justify-between flex`;
const Detail = tw.div`text-sm dark:text-gray-50 text-gray-900`;
const Italic = tw.div`italic text-xs dark:text-gray-300 text-gray-800 my-3`;

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
        {asset && <AssetSelect item={asset} isFyToken={asset.symbol.includes('FY') || false} pool={pool} />}
      </AssetSelectWrap>
    </AssetSelectOuter>
  </InputStyleContainer>
);

const AddConfirmation = ({ form, action, disabled, loading }: IAddConfirmation) => {
  const { pool, baseAmount, fyTokenAmount, useFyToken, method } = form;
  const { lpTokenPreview } = useAddLiquidityPreview(pool!, baseAmount, method!);
  const timeTillMaturity_ = useTimeTillMaturity(pool?.maturity!);

  return (
    <Container>
      <Wrap>
        <InputsOuter>
          <InputsWrap>
            <ConfirmItem value={baseAmount} asset={pool?.base!} pool={pool!} />
            {useFyToken && (
              <>
                <Arrow isPlusIcon={true} />
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
              <Detail>LP Tokens to Receive</Detail>
              <Detail>{lpTokenPreview}</Detail>
            </DetailWrap>
          </DetailsWrap>
        </InputStyleContainer>
        <Italic>Output is estimated.</Italic>
        <Button action={action} disabled={disabled} loading={loading}>
          {loading ? 'Add Liquidity Initiated...' : 'Confirm Add Liquidity'}
        </Button>
      </Wrap>
    </Container>
  );
};

export default AddConfirmation;
