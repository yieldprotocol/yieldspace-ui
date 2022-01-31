import { useState } from 'react';
import AssetSelect from '../common/AssetSelect';

interface IDeposit {
  symbol: string | null;
  amount: string;
  balance: string;
  setAsset: (asset: string) => void;
}

const Deposit = ({ symbol, amount, balance, setAsset }: IDeposit) => (
  <div className="flex bg-gray-700 rounded-md justify-between p-2 w-full gap-20">
    <div className="text-center align-middle">
      <span>{amount}</span>
    </div>
    <AssetSelect asset={symbol} setAsset={setAsset} />
  </div>
);

export default Deposit;
