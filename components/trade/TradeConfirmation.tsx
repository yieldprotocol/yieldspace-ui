import tw from 'tailwind-styled-components';
import Arrow from './Arrow';
import AssetSelect from '../common/AssetSelect';
import { IAsset, IPool } from '../../lib/protocol/types';
import Button from '../common/Button';
import useTimeTillMaturity from '../../hooks/useTimeTillMaturity';
import InfoIcon from '../common/InfoIcon';
import { ITradeForm } from './TradeWidget';
import { valueAtDigits } from '../../utils/appUtils';
import { calculateSlippage } from '../../utils/yieldMath';
import { DEFAULT_SLIPPAGE, SLIPPAGE_KEY } from '../../constants';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  Container,
  InputsWrap,
  InputStyleContainer,
  InputStyle,
  DetailsWrap,
  DetailWrap,
  LineBreak,
  DetailGray,
  Detail,
  Italic,
} from '../styles/confirm';

const AssetSelectOuter = tw.div`min-w-fit dark:text-gray-50`;
const AssetSelectWrap = tw.div`p-1`;

interface ITradeConfirmation {
  form: ITradeForm;
  interestRate: string;
  action: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const ConfirmItem = ({ value, asset, pool }: { value: string; asset: IAsset; pool: IPool }) => (
  <InputStyleContainer>
    <InputStyle>{value}</InputStyle>
    <AssetSelectOuter>
      <AssetSelectWrap>
        <AssetSelect item={asset} isFyToken={asset.symbol.includes('FY') || false} pool={pool} />
      </AssetSelectWrap>
    </AssetSelectOuter>
  </InputStyleContainer>
);

const TradeConfirmation = ({ form, interestRate, action, disabled, loading }: ITradeConfirmation) => {
  const [slippageTolerance] = useLocalStorage(SLIPPAGE_KEY, DEFAULT_SLIPPAGE);
  const { pool, fromAmount, fromAsset, toAmount, toAsset } = form;
  const timeTillMaturity_ = useTimeTillMaturity(pool?.maturity!);
  const fromAmount_ = valueAtDigits(fromAmount, fromAsset?.digitFormat!);
  const toAmount_ = valueAtDigits(toAmount, toAsset?.digitFormat!);
  const toAmountLessSlippage_ = valueAtDigits(
    calculateSlippage(toAmount || '0', slippageTolerance, true),
    toAsset?.digitFormat!
  );

  const maturityDescription = pool?.isMature ? `Mature` : `${timeTillMaturity_} until maturity`;

  return (
    <Container>
      <InputsWrap>
        <ConfirmItem value={fromAmount_} asset={fromAsset!} pool={pool!} />
        <Arrow />
        <ConfirmItem value={toAmount_} asset={toAsset!} pool={pool!} />
      </InputsWrap>
      <InputStyleContainer>
        <DetailsWrap>
          <DetailWrap>
            <Detail>Maturity</Detail>
            <Detail>
              <div>{pool?.displayName}</div>
              <Italic>
                <div className="float-right">{maturityDescription}</div>
              </Italic>
            </Detail>
          </DetailWrap>
          <DetailWrap>
            <Detail>Expected output</Detail>
            <Detail>
              {toAmount_} {toAsset?.symbol}
            </Detail>
          </DetailWrap>
          <LineBreak />
          <DetailWrap>
            <DetailGray>Minimum received after slippage</DetailGray>
            <DetailGray>{toAmountLessSlippage_}</DetailGray>
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
      <div className="my-3 text-center">
        <Italic>
          Output is estimated. You will receive at least {toAmountLessSlippage_} in {toAsset?.symbol} or the transaction
          will revert.
        </Italic>
      </div>
      <Button action={action} disabled={disabled} loading={loading}>
        {loading ? 'Trade Initiated...' : 'Confirm Trade'}
      </Button>
    </Container>
  );
};

export default TradeConfirmation;
