import tw from 'tailwind-styled-components';
import AssetSelect from '../common/AssetSelect';

const Input = tw.input`text-xl font-bold appearance-none w-full bg-gray-700 focus:text-gray-50 text-gray-300  py-3 px-4 leading-tight focus:outline-none `;

interface IDeposit {
  asset: string | null;
  amount: string;
  balance: string;
  setAsset: (asset: string) => void;
  setAmount: (amount: string) => void;
}

const Deposit = ({ asset, amount, balance, setAsset, setAmount }: IDeposit) => (
  <div className="flex bg-gray-700 rounded-md justify-between p-1 w-full gap-10 align-middle">
    <div className="ml-3 text-center text-lg align-middle my-auto">
      <Input
        type="text"
        inputMode="decimal"
        value={amount}
        placeholder="0.0"
        onChange={(e) => setAmount(e.target.value)}
      />
    </div>
    <div className="w-44 p-1">
      <AssetSelect asset={asset} setAsset={setAsset} />
    </div>
  </div>
);

export default Deposit;
