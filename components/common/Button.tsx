import { FC } from 'react';
import tw from 'tailwind-styled-components';
const Style = tw.button`h-full w-full justify-center dark:bg-secondary-500/25 bg-secondary-600/50 align-middle px-4 py-2 dark:text-secondary-500 text-gray-50 rounded-md dark:hover:bg-secondary-600/25 hover:bg-secondary-500/50`;

interface IButton {
  action: () => void;
  disabled?: boolean;
}
const Button: FC<IButton> = ({ action, disabled, children }) => (
  <Style onClick={action} disabled={disabled}>
    {children}
  </Style>
);

export default Button;
