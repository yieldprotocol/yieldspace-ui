import { useState } from 'react';
import tw from 'tailwind-styled-components';
import ConnectModal from './ConnectModal';
import Dropdown from './ConnectDropdown';
import Chain from './Chain';
import ETHBalance from './common/ETHBalance';
import { useAccount } from 'wagmi';

const ConnectButton = tw.button`bg-primary-500/25 align-middle px-4 py-2 text-primary-500 rounded-md hover:bg-primary-600/25`;

const Account = () => {
  const account = useAccount();
  const [connectModalOpen, setConnectModalOpen] = useState<boolean>(false);
  return (
    <div className="flex justify-end">
      {!account ? (
        <ConnectButton onClick={() => setConnectModalOpen(true)}>Connect Wallet</ConnectButton>
      ) : (
        <div className="flex gap-3">
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
