import { FC } from 'react';
import tw from 'tailwind-styled-components';

const Style = tw.button`bg-primary-700 h-full w-full px-4 py-2.5 dark:text-gray-50 text-gray-50 rounded-lg`;

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
