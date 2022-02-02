import Image from 'next/image';
import type { Web3ReactHooks } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';
import { Network } from '@web3-react/network';
import type { Connector } from '@web3-react/types';
import { useState } from 'react';
import { getAddChainParameters } from '../config/chains';
import { connectors } from '../connectors';
import tw from 'tailwind-styled-components';
import Modal from './common/Modal';
import metamaskLogo from '../public/logos/metamask.png';

const Inner = tw.div`p-2 space-y-2`;
const ConnectorButton = tw.button`w-full gap-4 bg-gray-500/25 align-middle px-4 py-3 text-primary-500 rounded-md hover:bg-gray-600/25 flex`;
const ConnectorButtonText = tw.span`align-middle text-gray-50`;

const getName = (connector: Connector) => {
  if (connector instanceof MetaMask) {
    return 'MetaMask';
  } else if (connector instanceof WalletConnect) {
    return 'WalletConnect';
  } else if (connector instanceof Network) {
    return 'Network';
  } else {
    return 'Unknown';
  }
};

function Connection({
  connector,
  hooks: { useChainId, useIsActivating, useError, useIsActive },
}: {
  connector: Connector;
  hooks: Web3ReactHooks;
}) {
  const isActivating = useIsActivating();
  const error = useError();
  const active = useIsActive();

  const [desiredChainId] = useState<number>(-1);

  const status = () => {
    if (error) {
      return `Try again?`;
    } else if (active) {
      return 'Connected';
    } else {
      return isActivating ? 'Connecting...' : 'Connect';
    }
  };

  return (
    <ConnectorButton
      onClick={() => connector.activate(desiredChainId === -1 ? undefined : getAddChainParameters(desiredChainId))}
      disabled={isActivating || active}
    >
      <Image src={metamaskLogo} height={20} width={20} alt="metamask-logo" />
      <div className="flex w-full justify-between">
        <ConnectorButtonText>{getName(connector)}</ConnectorButtonText>
        <ConnectorButtonText>{status()}</ConnectorButtonText>
      </div>
    </ConnectorButton>
  );
}

const ConnectModal = ({ modalOpen, setModalOpen }: { modalOpen: boolean; setModalOpen: (isOpen: boolean) => void }) => (
  <Modal isOpen={modalOpen} setIsOpen={setModalOpen}>
    <Inner>
      {connectors.map(([connector, hooks], i) => (
        <div key={i}>
          <Connection connector={connector} hooks={hooks} />
        </div>
      ))}
    </Inner>
  </Modal>
);

export default ConnectModal;
