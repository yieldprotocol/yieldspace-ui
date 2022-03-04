import tw from 'tailwind-styled-components';
import Arrow from './Arrow';
import AssetSelect from '../common/AssetSelect';
import { IAsset, IPool } from '../../lib/protocol/types';
import Button from '../common/Button';
import useTimeTillMaturity from '../../hooks/useTimeTillMaturity';
import InfoIcon from '../common/InfoIcon';

const Container = tw.div`relative flex justify-center items-center w-full`;
const Wrap = tw.div`w-full text-center text-lg align-middle items-center`;
const InputStyleContainer = tw.div`flex rounded-md justify-between p-1 w-full gap-5 align-middle border dark:border-gray-800 dark:bg-gray-800 bg-gray-300 border-gray-300`;
const InputsOuter = tw.div`flex items-center justify-center relative w-full`;
const InputStyle = tw.div`h-full caret-gray-800 dark:caret-gray-50 text-2xl appearance-none w-full dark:bg-gray-800 bg-gray-300 dark:focus:text-gray-50 focus:text-gray-800 dark:text-gray-300 text-gray-800 py-1 px-4 leading-tight focus:outline-none `;
const InputInner = tw.div`w-auto ml-3 text-center text-lg align-middle my-1 items-center`;
const AssetSelectOuter = tw.div`min-w-fit`;
const AssetSelectWrap = tw.div`p-1`;
const InputsWrap = tw.div`w-full flex flex-col gap-1 my-5`;
const DetailsWrap = tw.div`grid w-full p-2 gap-2`;
const DetailWrap = tw.div`justify-between flex`;
const Detail = tw.div`text-sm dark:text-gray-50`;
const DetailGray = tw.div`italic text-gray-300 text-sm`;
const Italic = tw.div`italic text-xs text-gray-300 my-3`;

interface ITradeConfirmation {
  pool: IPool;
  fromValue: string;
  fromAsset: IAsset;
  toValue: string;
  toAsset: IAsset;
  interestRate: string;
  action: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const ConfirmItem = ({ value, asset }: { value: string; asset: IAsset }) => (
  <InputStyleContainer>
    <InputInner>
      <InputStyle>{value}</InputStyle>
    </InputInner>
    <AssetSelectOuter>
      <AssetSelectWrap>
        <AssetSelect item={asset} isFyToken={asset.symbol.includes('FY') || false} />
      </AssetSelectWrap>
    </AssetSelectOuter>
  </InputStyleContainer>
);

const TradeConfirmation = ({
  pool,
  fromValue,
  fromAsset,
  toValue,
  toAsset,
  interestRate,
  action,
  disabled,
  loading,
}: ITradeConfirmation) => {
  const timeTillMaturity_ = useTimeTillMaturity(pool.maturity);

  return (
    <Container>
      <Wrap>
        <InputsOuter>
          <InputsWrap>
            <ConfirmItem value={fromValue} asset={fromAsset} />
            <Arrow />
            <ConfirmItem value={toValue} asset={toAsset} />
          </InputsWrap>
        </InputsOuter>
        <InputStyleContainer>
          <DetailsWrap>
            <DetailWrap>
              <Detail>Maturity</Detail>
              <div className="text-sm dark:text-gray-50">
                <div className="flex justify-end">{pool.displayName}</div>
                <div className="italic text-xs dark:text-gray-300">{timeTillMaturity_} until maturity</div>
              </div>
            </DetailWrap>
            <DetailWrap>
              <Detail>Expected output</Detail>
              <Detail>
                {toValue} {toAsset.symbol}
              </Detail>
            </DetailWrap>
            <div className="w-full h-[1px] bg-gray-700" />
            <DetailWrap>
              <DetailGray>Minimum received after slippage</DetailGray>
              <DetailGray>{toValue}</DetailGray>
            </DetailWrap>
            <DetailWrap>
              <div className="flex">
                <DetailGray>Expected interest rate</DetailGray>
                <InfoIcon infoText="if held until maturity" height=".9rem" width=".9rem" />
              </div>
              <DetailGray>{interestRate}%</DetailGray>
            </DetailWrap>
          </DetailsWrap>
        </InputStyleContainer>
        <Italic>
          Output is estimated. You will receive at least {toValue} in {toAsset.symbol} or the transaction will revert.
        </Italic>
        <Button action={action} disabled={disabled} loading={loading}>
          {loading ? 'Trade Initiated...' : 'Confirm Trade'}
        </Button>
      </Wrap>
    </Container>
  );
};

export default TradeConfirmation;
