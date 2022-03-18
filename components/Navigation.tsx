import tw from 'tailwind-styled-components';
import Link from 'next/link';
import Account from './Account';
import { useRouter } from 'next/router';
import YieldMark from './common/YieldMark';

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

type LinkItemProps = {
  $current: boolean;
};

const InnerContainer = tw.div`flex py-2 px-10 align-middle relative items-center justify-between`;
const LinksWrap = tw.div`flex space-x-8 items-center`;
const LinkItem = tw.div<LinkItemProps>`${(p) =>
  p.$current
    ? 'text-primary-500'
    : 'dark:text-gray-100 text-gray-800'} hover:text-primary-500 dark:hover:text-primary-400 no-underline cursor-pointer`;

const Navigation = () => {
  const router = useRouter();
  const navigation = [
    { name: 'Trade', href: '/trade' },
    { name: 'Pool', href: '/pool' },
  ];

  return (
    <Container>
      <InnerContainer>
        <LinksWrap>
          <Link href="/trade" passHref>
            <div className="hover:cursor-pointer p-2.5 rounded-full bg-gray-700/20">
              <YieldMark
                colors={['#f79533', '#f37055', '#ef4e7b', '#a166ab', '#5073b8', '#1098ad', '#07b39b', '#6fba82']}
              />
            </div>
          </Link>
          {navigation.map((x) => (
            <Link href={x.href} key={x.name} passHref>
              <LinkItem $current={router.pathname.includes(x.href)}>{x.name}</LinkItem>
            </Link>
          ))}
        </LinksWrap>
        <Account />
      </InnerContainer>
    </Container>
  );
};

export default Navigation;
