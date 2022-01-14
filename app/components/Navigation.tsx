import tw from 'tailwind-styled-components';
import Link from 'next/link';

const Container = tw.div`
  sticky
  top-0 
  w-full 
  flex-none 
  z-50 
  border-b 
  dark:bg-gray-900
  border-gray-50
  bg-white 
`;

const InnerContainer = tw.div`flex py-6 px-8 align-middle relative items-center`;
const LinkWrap = tw.div`flex space-x-8`;
const LinkItem = tw.a`dark:text-slate-100 text-zinc-900 hover:text-sky-500 dark:hover:text-sky-400`;

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
      </InnerContainer>
    </Container>
  );
};

export default Navigation;
