import { FC } from 'react';
import tw from 'tailwind-styled-components';

interface IInterestRateInput {
  rate: string;
  setRate: (rate: string) => void;
}
const Input = tw.input`caret-gray-800 dark:caret-gray-50 text-2xl rounded-md font-bold appearance-none w-full dark:bg-gray-900 bg-gray-100 dark:focus:text-gray-50 focus:text-gray-800 text-gray-300 py-3 px-4 leading-tight focus:outline-none`;

const InterestRateInput: FC<IInterestRateInput> = ({ rate, setRate }) => (
  <div className="flex justify-between items-center">
    <Input
      type="number"
      inputMode="decimal"
      value={rate}
      placeholder="0.0"
      onChange={(e) => setRate(e.target.value)}
      min="0"
    />
    <div className="whitespace-nowrap px-2">Interest Rate</div>
  </div>
);

export default InterestRateInput;
