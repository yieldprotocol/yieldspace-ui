import { FC } from 'react';
import tw from 'tailwind-styled-components';
import Main from '../components/Main';
import Navigation from './Navigation';

const Container = tw.div`text-gray-50 justify-items-center`;

const Layout: FC = ({ children }) => {
  return (
    <Container>
      <Navigation />
      <Main>{children}</Main>
    </Container>
  );
};

export default Layout;
