import { FC } from 'react';
import tw from 'tailwind-styled-components';
export const Wrap = tw.div`mx-auto max-w-md p-2 border border-secondary-400 shadow-sm rounded-lg dark:bg-gray-800 bg-gray-200 dark:text-gray-50`;

const BorderWrap: FC = ({ children }) => <Wrap>{children}</Wrap>;

export default BorderWrap;
