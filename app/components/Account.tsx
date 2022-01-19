import { useState } from 'react';
import tw from 'tailwind-styled-components';
import { useAppSelector } from 'state/hooks/general';
import Connect from './ConnectModal';
import Dropdown from './Dropdown';

const ConnectButton = tw.button`bg-primary-500/25 align-middle px-4 py-2 text-primary-500 rounded-md hover:bg-primary-600/25`;

const Account = () => {
  const {
    connection: { account },
  } = useAppSelector(({ chain }) => chain);
  const [connectModalOpen, setConnectModalOpen] = useState<boolean>(false);

  return (
    <div>
      {!account ? (
        <ConnectButton onClick={() => setConnectModalOpen(true)}>Connect Wallet</ConnectButton>
      ) : (
        <Dropdown setModalOpen={setConnectModalOpen} />
      )}
      {connectModalOpen && <Connect modalOpen={connectModalOpen} setModalOpen={setConnectModalOpen} />}
    </div>
  );
};

export default Account;
