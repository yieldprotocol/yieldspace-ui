import tw from 'tailwind-styled-components';
import InfoIcon from '../common/InfoIcon';
import { Flex } from '../styles/confirm';

interface IInterestRateInput {
  rate: string;
  setRate: (rate: string) => void;
  disabled?: boolean;
  negative?: boolean; // if the trade will lead to "losing" value (aka when borrowing: selling fyToken for base), then the interest rate is "negative"
}
const Text = tw.div`text-2xl`;
const Input = tw.input`text-right text-2xl rounded-md w-full dark:bg-gray-900 bg-gray-100 py-3 px-3`;

const InterestRateInput = ({ rate, setRate, disabled = false }: IInterestRateInput) => (
  <div className="flex justify-between items-center dark:text-gray-200 text-gray-700">
    <Flex>
      <div className="whitespace-nowrap">Interest Rate</div>
      <InfoIcon
        infoText={
          +rate > 0
            ? 'the estimated APR you will receive if held until maturity'
            : 'the estimated APR you will pay if held until maturity'
        }
        height=".9rem"
        width=".9rem"
      />
    </Flex>
    <Input
      type="number"
      inputMode="decimal"
      value={rate}
      placeholder="0.0"
      onChange={(e) => setRate(e.target.value)}
      min="0"
      disabled={disabled}
    />
    <Text>%</Text>
  </div>
);

export default InterestRateInput;
