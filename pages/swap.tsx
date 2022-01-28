import ClaimTable from '../components/ClaimTable';
import tw from 'tailwind-styled-components';

const Container = tw.div`text-center align-middle justify-center`;
const BorderWrap = tw.div`flex border-2 border-secondary-400 shadow-sm rounded-lg bg-gray-800`;
const Inner = tw.div`m-4 text-center align-middle`;
const Header = tw.div`text-lg justify-items-start`;
const HeaderText = tw.span``;
const InputsWrap = tw.div`mt-4 gap-4`;
const InputWrap = tw.div`my-4`;
const ButtonWrap = tw.div`m-2`;
const Button = tw.button`w-full bg-primary-500/25 align-middle px-4 py-2 text-primary-500 rounded-md hover:bg-primary-600/25`;
const InnerWrap = tw.div`flex gap-10`;

const Claim = () => {
  return (
    <Container>
      <Inner>
        <Header>
          <HeaderText>Claim Reimbursement Tokens</HeaderText>
          {' - '}
          <HeaderText>Show All Claimed/Claimable Reimbursement Tokens in Table Form</HeaderText>
        </Header>
      </Inner>
      <BorderWrap>
        <ClaimTable />
      </BorderWrap>
    </Container>
  );
};

export default Claim;
