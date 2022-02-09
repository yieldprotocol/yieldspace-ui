import tw from 'tailwind-styled-components';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const DynamicPools = dynamic(() => import('../../components/pool/Pools'), { ssr: false });

const Container = tw.div`p-20 text-center align-middle justify-center`;
const BorderWrap = tw.div`mx-auto max-w-md p-2 border border-secondary-400 shadow-sm rounded-lg dark:bg-gray-800 bg-gray-200`;
const Inner = tw.div`m-4 text-center`;
const Header = tw.div`text-lg justify-items-start align-middle`;
const Button = tw.button`w-full bg-primary-500/25 align-middle px-4 py-2 text-primary-500 rounded-md hover:bg-primary-600/25`;
const InnerWrap = tw.div`flex gap-10`;

const Pool = () => (
  <Container>
    <InnerWrap>
      <BorderWrap>
        <Inner>
          <div className="flex justify-between align-middle gap-10 items-center">
            <Header>Your Positions</Header>
            <Link href="/pool/add" passHref>
              <div className="w-30">
                <Button>+New Position</Button>
              </div>
            </Link>
          </div>
        </Inner>
        <DynamicPools />
      </BorderWrap>
    </InnerWrap>
  </Container>
);

export default Pool;
