import tw from 'tailwind-styled-components';
import Link from 'next/link';
import Account from './Account';
import { useState } from 'react';
import { useRouter } from 'next/router';

const Container = tw.div`
  sticky
  top-0 
  w-full 
  flex-none 
  z-50 
  border-b 
  dark:bg-gray-900
  border-gray-50
  dark:border-gray-800
  bg-white 
`;

type LinkItemProps = {
  $current: boolean;
};

const InnerContainer = tw.div`flex py-4 px-10 align-middle relative items-center justify-between`;
const LinksWrap = tw.div`flex space-x-8`;
const LinkItem = tw.a<LinkItemProps>`${(p) =>
  p.$current ? 'dark:text-primary-500' : 'dark:text-gray-100'} hover:text-primary-500 dark:hover:text-primary-400`;

const Navigation = () => {
  const router = useRouter();
  const navigation = [
    { name: 'Trade', href: '/trade' },
    { name: 'Pool', href: '/pool' },
  ];

  const [activeNav, setActiveNav] = useState(navigation);

  return (
    <Container>
      <InnerContainer>
        <LinksWrap>
          {navigation.map((x) => (
            <Link href={x.href} key={x.name} passHref>
              <LinkItem $current={router.pathname === x.href}>{x.name}</LinkItem>
            </Link>
          ))}
        </LinksWrap>
        <Account />
      </InnerContainer>
    </Container>
  );
};

export default Navigation;
