import Pools from '../../components/pool/Pools';
import tw from 'tailwind-styled-components';
import Link from 'next/link';

const Container = tw.div`p-20 text-center align-middle justify-center`;
const BorderWrap = tw.div`mx-auto max-w-md p-2 border-2 border-secondary-400 shadow-sm rounded-lg bg-gray-800`;
const Inner = tw.div`m-4 text-center`;
const Header = tw.div`text-lg justify-items-start align-middle`;
const HeaderText = tw.span`align-middle`;
const Button = tw.button`w-full bg-primary-500/25 align-middle px-4 py-2 text-primary-500 rounded-md hover:bg-primary-600/25`;
const InnerWrap = tw.div`flex gap-10`;

const Pool = () => {
  return (
    <Container>
      <InnerWrap>
        <BorderWrap>
          <Inner>
            <div className="flex justify-between align-middle">
              <Header>
                <HeaderText>Your Positions</HeaderText>
              </Header>
              <Link href="/pool/add">
                <div className="w-30">
                  <Button>+New Position</Button>
                </div>
              </Link>
            </div>
          </Inner>
          <Pools />
        </BorderWrap>
      </InnerWrap>
    </Container>
  );
};

export default Pool;
