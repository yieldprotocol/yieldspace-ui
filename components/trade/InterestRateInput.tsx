import { FC } from 'react';
import tw from 'tailwind-styled-components';

interface IInterestRateInput {
  rate: string;
  setRate: (rate: string) => void;
  disabled?: boolean;
  negative?: boolean; // if the trade will lead to "losing" value (aka when borrowing: selling fyToken for base), then the interest rate is "negative"
}
const Text = tw.div`text-2xl`;
const Input = tw.input`text-right text-2xl rounded-md w-full dark:bg-gray-900 bg-gray-100 py-3 px-3`;

const InterestRateInput: FC<IInterestRateInput> = ({ rate, setRate, disabled = false, negative = false }) => (
  <div className="flex justify-between items-center dark:text-gray-200 text-gray-700">
    <div className="whitespace-nowrap">Interest Rate</div>
    <Input
      type="number"
      inputMode="decimal"
      value={`${negative ? '-' : ''}${rate}`}
      placeholder="0.0"
      onChange={(e) => setRate(e.target.value)}
      min="0"
      disabled={disabled}
    />
    <Text>%</Text>
  </div>
);

export default InterestRateInput;
