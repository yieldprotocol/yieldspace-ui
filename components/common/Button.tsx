import { FC } from 'react';
import tw from 'tailwind-styled-components';
const Style = tw.button`h-full w-full justify-center bg-secondary-500/25 align-middle px-4 py-2 text-secondary-500 rounded-md hover:bg-secondary-600/25`;

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
