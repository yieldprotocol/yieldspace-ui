import tw from 'tailwind-styled-components';
import { IAsset } from '../../lib/protocol/types';
import AssetSelect from '../common/AssetSelect';

const Input = tw.input`text-2xl font-bold appearance-none w-full bg-gray-700 focus:text-gray-50 text-gray-300  py-3 px-4 leading-tight focus:outline-none `;

interface IDeposit {
  asset: IAsset | undefined;
  amount: string;
  setAsset: (asset: string) => void;
  setAmount: (amount: string) => void;
}

const Deposit = ({ asset, amount, setAsset, setAmount }: IDeposit) => (
  <div className="flex bg-gray-700 rounded-md justify-between p-1 w-full gap-5 align-middle hover:border-2 hover:border-secondary-500 border-2 border-gray-700">
    <div className="ml-3 text-center text-lg align-middle my-auto">
      <Input
        type="number"
        inputMode="decimal"
        value={amount}
        placeholder="0.0"
        onChange={(e) => setAmount(e.target.value)}
        min="0"
      />
    </div>
    <div className="">
      <div className="w-36 p-1">
        <AssetSelect asset={asset} setAsset={setAsset} />
      </div>
      {asset && (
        <div className="mt-2 text-sm align-middle text-right mr-2 text-gray-300">
          <span>Balance: {asset.balance_}</span>
        </div>
      )}
    </div>
  </div>
);

export default Deposit;
