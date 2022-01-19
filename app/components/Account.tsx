import { useAppSelector } from 'state/hooks/general';
import Connect from './Connect';
import Dropdown from './Dropdown';

const Account = () => {
  const {
    connection: { account },
  } = useAppSelector(({ chain }) => chain);

  return <div>{account ? <Dropdown /> : <Connect />}</div>;
};

export default Account;
