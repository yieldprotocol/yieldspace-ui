import tw from 'tailwind-styled-components';
import Link from 'next/link';
import Connect from './Connect';
import Account from './Account';

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

const InnerContainer = tw.div`flex py-4 px-10 align-middle relative items-center justify-between`;
const LinkWrap = tw.div`flex space-x-8`;
const LinkItem = tw.a`dark:text-gray-100 text-gray-900 hover:text-primary-500 dark:hover:text-primary-400`;

const Navigation = () => {
  const links = ['Trade', 'Create'];
  return (
    <Container>
      <InnerContainer>
        <LinkWrap>
          {links.map((l, i) => (
            <Link href={`/${l.toLowerCase()}`} key={i} passHref>
              <LinkItem>{l}</LinkItem>
            </Link>
          ))}
        </LinkWrap>
        <Account />
      </InnerContainer>
    </Container>
  );
};

export default Navigation;
