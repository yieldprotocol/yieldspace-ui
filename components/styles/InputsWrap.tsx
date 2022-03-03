import { FC } from 'react';
import tw from 'tailwind-styled-components';
export const Wrap = tw.div`flex flex-col gap-1 my-5`;

const InputsWrap: FC = ({ children }) => <Wrap>{children}</Wrap>;

export default InputsWrap;
