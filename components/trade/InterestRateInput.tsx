import { FC } from 'react';
import tw from 'tailwind-styled-components';

interface IInterestRateInput {
  rate: string;
  setRate: (rate: string) => void;
  disabled?: boolean;
}
const Input = tw.input`caret-gray-800 dark:caret-gray-50 text-2xl rounded-md appearance-none w-full dark:bg-gray-900 bg-gray-100 dark:focus:text-gray-50 focus:text-gray-800 dark:text-gray-300 text-gray-700 py-3 px-4 leading-tight focus:outline-none`;

const InterestRateInput: FC<IInterestRateInput> = ({ rate, setRate, disabled = false }) => (
  <div className="flex justify-between items-center">
    <Input
      type="number"
      inputMode="decimal"
      value={rate}
      placeholder="0.0"
      onChange={(e) => setRate(e.target.value)}
      min="0"
      disabled={disabled}
    />
    <div>%</div>
    <div className="whitespace-nowrap px-2">Interest Rate</div>
  </div>
);

export default InterestRateInput;
