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

const Redeem = () => {
  return (
    <Container>
      <BorderWrap>
        <Inner>
          <Header>
            <HeaderText>Redeem Reimbursement Token for Treasury Token if after maturity only</HeaderText>
          </Header>
          <InputsWrap>
            <BorderWrap>
              <Header>
                <HeaderText>choose riToken</HeaderText>
              </Header>
              <InputWrap>amount</InputWrap>
              <InputWrap>value</InputWrap>
            </BorderWrap>
          </InputsWrap>
        </Inner>
        <ButtonWrap>
          <Button>Redeem</Button>
        </ButtonWrap>
      </BorderWrap>
    </Container>
  );
};

export default Redeem;
