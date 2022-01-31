import { useState } from 'react';
import tw from 'tailwind-styled-components';
import Connect from './ConnectModal';
import Dropdown from './Dropdown';
import useConnector from '../hooks/useConnector';
import Chain from './Chain';

const ConnectButton = tw.button`bg-primary-500/25 align-middle px-4 py-2 text-primary-500 rounded-md hover:bg-primary-600/25`;

const Account = () => {
  const { account } = useConnector();

  const [connectModalOpen, setConnectModalOpen] = useState<boolean>(false);

  return (
    <div>
      {!account ? (
        <ConnectButton onClick={() => setConnectModalOpen(true)}>Connect Wallet</ConnectButton>
      ) : (
        <div className="flex gap-5">
          <Chain />
          <Dropdown setModalOpen={setConnectModalOpen} />
        </div>
      )}
      {connectModalOpen && <Connect modalOpen={connectModalOpen} setModalOpen={setConnectModalOpen} />}
    </div>
  );
};

export default Account;
