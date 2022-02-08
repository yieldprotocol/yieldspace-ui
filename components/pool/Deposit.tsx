import tw from 'tailwind-styled-components';
import { IAsset } from '../../lib/protocol/types';
import AssetSelect from '../common/AssetSelect';

type DivProps = {
  $disabled?: boolean;
};

const Container = tw.div<DivProps>`${(p) =>
  p.$disabled
    ? 'bg-gray-700/50'
    : 'bg-gray-700'} flex rounded-md justify-between p-1 w-full gap-5 align-middle hover:border hover:border-secondary-500 border border-gray-700`;
const Input = tw.input`text-2xl font-bold appearance-none w-full bg-gray-700 focus:text-gray-50 text-gray-300  py-3 px-4 leading-tight focus:outline-none `;
const Inner = tw.div`ml-3 text-center text-lg align-middle my-auto`;

interface IDeposit {
  asset: IAsset | undefined;
  balance: string;
  amount: string;
  setAmount: (amount: string) => void;
  disabled: boolean;
}

const Deposit = ({ asset, balance, amount, setAmount, disabled }: IDeposit) => (
  <Container $disabled={disabled}>
    <Inner>
      <Input
        type="number"
        inputMode="decimal"
        value={amount}
        placeholder="0.0"
        onChange={(e) => setAmount(e.target.value)}
        min="0"
      />
    </Inner>
    <div className="">
      <div className="w-32 p-1 float-right">
        <AssetSelect asset={asset} />
      </div>
      {asset && (
        <div className="mt-2 text-xs align-middle text-right mr-2 text-gray-300">
          <span>Balance: {balance}</span>
        </div>
      )}
    </div>
  </Container>
);

export default Deposit;
