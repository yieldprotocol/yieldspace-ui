import { FC } from 'react';
import Main from '../components/Main';
import Navigation from './Navigation';

const Layout: FC = ({ children }) => (
  <>
    <Navigation />
    <Main>{children}</Main>
  </>
);

export default Layout;
