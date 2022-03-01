import { FC } from 'react';
import tw from 'tailwind-styled-components';

const Style = tw.button`flex gap-3 items-center justify-center bg-primary-700 h-full w-full px-4 py-2.5 dark:text-gray-50 text-gray-50 rounded-lg hover:opacity-80`;
const Spinner = tw.div`spinner-border animate-spin inline-block w-6 h-6 border-4 rounded-full border-primary-200 border-t-secondary-400`;

interface IButton {
  action: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const Button: FC<IButton> = ({ action, disabled, loading, children }) => (
  <Style onClick={action} disabled={disabled}>
    {loading && <Spinner />}
    {children}
  </Style>
);

export default Button;
