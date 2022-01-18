import Image from 'next/image';
import { CONNECTORS, CONNECTOR_INFO } from 'config/connectors';
import { useState } from 'react';
import { useAppSelector } from 'state/hooks/general';
import tw from 'tailwind-styled-components';
import Modal from './Modal';
import { useConnection } from '../hooks/useConnection';

const ConnectButton = tw.button`bg-primary-500/25 align-middle px-4 py-2 text-primary-500 rounded-md hover:bg-primary-600/25`;
const Inner = tw.div`p-2 space-y-2`;
const ConnectionButton = tw.button`w-full gap-4 bg-gray-500/25 align-middle px-4 py-3 text-primary-500 rounded-md hover:bg-gray-600/25  flex`;

const Connect = () => {
  const {
    connection: { connectionName, provider },
  } = useAppSelector(({ chain }) => chain);
  const {
    connectionActions: { connect },
  } = useConnection();
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleConnect = (connectorName: string) => {
    connect(connectorName);
    setModalOpen(false);
  };

  return (
    <>
      <ConnectButton onClick={() => setModalOpen(true)}>Connect Wallet</ConnectButton>
      <Modal isOpen={modalOpen} setIsOpen={setModalOpen}>
        <Inner>
          {[...CONNECTORS.keys()].map((name: string) => {
            const { displayName, image } = CONNECTOR_INFO.get(name);
            const currentConnector = CONNECTORS.get(name);
            const connected = provider && name === connectionName;

            return (
              <ConnectionButton key={name} onClick={() => !connected && handleConnect(name)}>
                <Image src={image} width={20} height={20} />
                {displayName}
              </ConnectionButton>
            );
          })}
        </Inner>
      </Modal>
    </>
  );
};

export default Connect;
