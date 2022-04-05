import { useState } from 'react';
import tw from 'tailwind-styled-components';
import ConnectModal from './ConnectModal';
import Dropdown from './ConnectDropdown';
import useConnector from '../hooks/useConnector';
import Chain from './Chain';
import ETHBalance from './common/ETHBalance';

const ConnectButton = tw.button`bg-primary-500/25 align-middle px-4 py-2 text-primary-500 rounded-md hover:bg-primary-600/25`;

const Account = () => {
  const { account } = useConnector();
  const [connectModalOpen, setConnectModalOpen] = useState<boolean>(false);
  return (
    <div>
      {!account ? (
        <ConnectButton onClick={() => setConnectModalOpen(true)}>Connect Wallet</ConnectButton>
      ) : (
        <div className="flex gap-3 justify-end">
          <Chain />
          <ETHBalance />
          <Dropdown setModalOpen={setConnectModalOpen} />
        </div>
      )}
      {connectModalOpen && <ConnectModal modalOpen={connectModalOpen} setModalOpen={setConnectModalOpen} />}
    </div>
  );
};

export default Account;
