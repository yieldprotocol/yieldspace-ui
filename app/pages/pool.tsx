import tw from 'tailwind-styled-components';

const Container = tw.div`p-20 text-center align-middle justify-center`;
const BorderWrap = tw.div`mx-auto max-w-md border-2 border-secondary-400 shadow-sm rounded-lg bg-gray-800`;
const Inner = tw.div`m-4 text-center align-middle`;
const Header = tw.div`text-lg justify-items-start`;
const HeaderText = tw.span``;
const InputsWrap = tw.div`mt-4 gap-4`;
const InputWrap = tw.div`my-4`;
const ButtonWrap = tw.div`m-2`;
const Button = tw.button`w-full bg-primary-500/25 align-middle px-4 py-2 text-primary-500 rounded-md hover:bg-primary-600/25`;

const Pool = () => {
  return (
    <Container>
      <BorderWrap>
        <Inner>
          <Header>
            <HeaderText>Create Pool</HeaderText>
          </Header>
          <InputsWrap>
            <BorderWrap>
              <Header>
                <HeaderText>riToken (reimbursement token)</HeaderText>
              </Header>
              <InputWrap>name (derived from underlying)</InputWrap>
              <InputWrap>symbol (derived from underlying)</InputWrap>
              <InputWrap>maturity (input)</InputWrap>
              <InputWrap>supply (input)</InputWrap>
              <InputWrap>receiver (derived from pool creator)</InputWrap>
            </BorderWrap>
            <InputWrap>Collateral Token (reimbursement token)</InputWrap>
            <InputWrap>Collateral Oracle</InputWrap>
            <InputWrap>Target Exchange Rate</InputWrap>
          </InputsWrap>
        </Inner>
        <ButtonWrap>
          <Button>Create Pool</Button>
        </ButtonWrap>
      </BorderWrap>
    </Container>
  );
};

export default Pool;
