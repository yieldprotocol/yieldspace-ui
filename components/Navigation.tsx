import Link from 'next/link';
import tw from 'tailwind-styled-components';
import Account from './Account';
import YieldMark from './common/YieldMark';
import NavTabs from './NavTabs';

const Container = tw.div`
  sticky
  top-0 
  w-full 
  flex-none 
  border-b 
  text-gray-800
  dark:text-gray-50
  border-gray-200
  dark:border-gray-800
`;

const Grid = tw.div`grid grid-cols-3 items-center px-10 py-2`;
const MarkWrap = tw.div`flex`;

const Navigation = () => (
  <Container>
    <Grid>
      <MarkWrap>
        <Link href="/trade" passHref>
          <div className="hover:cursor-pointer p-2.5 rounded-full bg-gray-700/20">
            <YieldMark
              colors={['#f79533', '#f37055', '#ef4e7b', '#a166ab', '#5073b8', '#1098ad', '#07b39b', '#6fba82']}
            />
          </div>
        </Link>
      </MarkWrap>
      <NavTabs />
      <Account />
    </Grid>
  </Container>
);

export default Navigation;
