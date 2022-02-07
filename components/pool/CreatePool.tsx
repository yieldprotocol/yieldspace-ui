import { FC } from 'react';
import tw from 'tailwind-styled-components';

const BorderWrap = tw.div`mx-auto p-2 border border-secondary-400 shadow-sm rounded-lg bg-gray-800`;
const Inner = tw.div`m-4 text-center`;
const Header = tw.div`text-lg justify-items-start align-middle`;
const HeaderText = tw.span`align-middle`;
const InputsWrap = tw.div`mt-4 gap-4`;
const InputWrap = tw.div`my-4`;
const ButtonWrap = tw.div`m-2`;
const Button = tw.button`w-full bg-primary-500/25 align-middle px-4 py-2 text-primary-500 rounded-md hover:bg-primary-600/25`;
const InnerWrap = tw.div`flex gap-10`;

interface IDeposit {
  header: string;
  amount: string;
}

const Deposit = ({ header, amount }: IDeposit) => (
  <InputWrap>
    <Header>
      <HeaderText>{header}</HeaderText>
    </Header>
  </InputWrap>
);

interface ICreatePoolProps {}

const CreatePool: FC<ICreatePoolProps> = () => (
  <InnerWrap>
    <BorderWrap>
      <Inner>
        <Header>
          <HeaderText>Create Reimbursement Token Pool</HeaderText>
        </Header>
        <InputsWrap>
          <div className="my-1.5">
            <div className="my-1.5">
              <HeaderText>Select Asset from Wallet to be used as treasury token</HeaderText>
            </div>
            <div className="w-40 mx-auto">
              <Button>Select Asset</Button>
            </div>
          </div>
          <div className="mt-4">
            <BorderWrap>
              <div className="p-2">
                <Header>
                  <HeaderText>riToken (reimbursement token)</HeaderText>
                </Header>
                <InputWrap>name (derived from treasury token underlying)</InputWrap>
                <InputWrap>symbol (derived from treasury token underlying)</InputWrap>
                <InputWrap>maturity (input)</InputWrap>
                <InputWrap>supply (input)</InputWrap>
                <InputWrap>receiver (derived from pool creator)</InputWrap>
              </div>
            </BorderWrap>
          </div>
          <Deposit header="Collateral Token (optional)" amount={'100'} />
          <InputWrap>Collateral Oracle (optional)</InputWrap>
          <InputWrap>Target Exchange Rate (optional)</InputWrap>
        </InputsWrap>
        <ButtonWrap>
          <Button>Create Pool</Button>
        </ButtonWrap>
      </Inner>
    </BorderWrap>
  </InnerWrap>
);

export default CreatePool;
