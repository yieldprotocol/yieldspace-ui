import { FC } from 'react';
import tw from 'tailwind-styled-components';
export const Wrap = tw.div`mx-auto max-w-md p-2 shadow-md rounded-xl dark:bg-gray-900 bg-gray-100 dark:text-gray-50`;

const BorderWrap: FC = ({ children }) => <Wrap>{children}</Wrap>;

export default BorderWrap;
