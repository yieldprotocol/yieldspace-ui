import tw from 'tailwind-styled-components';
import { useAppSelector } from 'state/hooks/general';
import { abbreviateHash } from 'utils/appUtils';
import Connect from './Connect';
import Dropdown from './Dropdown';

const Account = () => {
  const {
    connection: { account },
  } = useAppSelector(({ chain }) => chain);

  return <div>{account ? <Dropdown label={abbreviateHash(account)} /> : <Connect />}</div>;
};

export default Account;
