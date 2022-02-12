import { FC } from 'react';
import tw from 'tailwind-styled-components';
// const OuterStyle = tw.div`h-full w-full justify-center dark:bg-secondary-500/25 bg-secondary-600/50 align-middle px-4 py-2 dark:text-secondary-500 text-gray-50 rounded-md dark:hover:bg-secondary-600/25 hover:bg-secondary-500/50`;
const InnerStyle = tw.button`h-full w-full justify-center dark:bg-secondary-500/25 bg-secondary-600/50 align-middle px-4 py-2 dark:text-secondary-500 text-gray-50 rounded-md dark:hover:bg-secondary-600/25 hover:bg-secondary-500/50`;
const Outer = tw.div`h-full w-full rounded-xl  bg-secondary-600 hover:opacity-80`;
const Inner = tw.button`h-full w-full px-4 py-2.5 dark:text-gray-50 text-gray-50 rounded-lg`;
interface IButton {
  action: () => void;
  disabled?: boolean;
}
const Button: FC<IButton> = ({ action, disabled, children }) => (
  <Outer

  // style={{ background: `linear-gradient(101.3deg,#ff8320 26.97%,#48c295)` }}
  >
    <Inner onClick={action} disabled={disabled}>
      {children}
    </Inner>
  </Outer>
);

export default Button;
