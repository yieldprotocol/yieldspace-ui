import { FC } from 'react';
import tw from 'tailwind-styled-components';
const Wrap = tw.div`text-lg font-bold justify-items-start align-middle`;

const Header: FC = ({ children }) => <Wrap>{children}</Wrap>;

export default Header;
