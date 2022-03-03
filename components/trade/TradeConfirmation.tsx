import tw from 'tailwind-styled-components';
import Arrow from './Arrow';
import InputsWrap from '../styles/InputsWrap';
import AssetSelect from '../common/AssetSelect';
import { IAsset } from '../../lib/protocol/types';

const Container = tw.div`relative flex justify-center items-center w-full`;
const Outer = tw.div`flex items-center justify-end relative w-full`;
const InputStyle = tw.div`h-full caret-gray-800 dark:caret-gray-50 text-2xl appearance-none w-full dark:bg-gray-800 bg-gray-300 dark:focus:text-gray-50 focus:text-gray-800 dark:text-gray-300 text-gray-800 py-1 px-4 leading-tight focus:outline-none `;
const Inner = tw.div`grow-0 w-auto ml-3 text-center text-lg align-middle my-1 items-center`;
const AssetSelectOuter = tw.div`grow min-w-fit`;
const AssetSelectWrap = tw.div`p-1`;

interface ITradeConfirmation {
  fromValue: string;
  fromAsset: IAsset;
  toValue: string;
  toAsset: IAsset;
}

const ConfirmItem = (value: string, asset: IAsset) => (
  <Inner>
    <InputStyle>{value}</InputStyle>
    <AssetSelectOuter>
      <AssetSelectWrap>
        <AssetSelect item={asset} isFyToken={asset.symbol.includes('FY') || false} />
      </AssetSelectWrap>
    </AssetSelectOuter>
  </Inner>
);

const TradeConfirmation = ({ fromValue, fromAsset, toValue, toAsset }: ITradeConfirmation) => (
  <Container>
    <Outer>
      <InputsWrap>
        <ConfirmItem value={fromValue} asset={fromAsset} />
        <Arrow />
        <ConfirmItem value={toValue} asset={toAsset} />
      </InputsWrap>
    </Outer>
  </Container>
);

export default TradeConfirmation;
