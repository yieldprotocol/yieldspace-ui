import { FC } from 'react';
import tw from 'tailwind-styled-components';
const Wrap = tw.div`text-lg font-bold text-center justify-items-start align-middle dark:text-gray-50 whitespace-nowrap`;

const Header: FC = ({ children }) => <Wrap>{children}</Wrap>;

export default Header;
