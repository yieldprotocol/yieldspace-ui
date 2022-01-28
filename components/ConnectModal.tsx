import { utils } from 'ethers';
import Image from 'next/image';
import type { Web3ReactHooks } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';
import { Network } from '@web3-react/network';
import type { Connector } from '@web3-react/types';
import { useCallback, useEffect, useState } from 'react';
import { CHAINS, getAddChainParameters, URLS } from '../config/chains';
import { connectors } from '../connectors';
import { useAppDispatch, useAppSelector } from 'state/hooks/general';
import tw from 'tailwind-styled-components';
import Modal from './Modal';
import { updateConnection } from 'state/actions/chain';
import useBalances from '../hooks/useBalances';
import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/solid';
import metamaskLogo from '../public/logos/metamask.png';
import walletConnectLogo from '../public/logos/walletconnect.svg';

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

function Status({
  connector,
  hooks: { useChainId, useAccounts, useError },
}: {
  connector: Connector;
  hooks: Web3ReactHooks;
}) {
  const chainId = useChainId();
  const accounts = useAccounts();
  const error = useError();

  const connected = Boolean(chainId && accounts);

  return (
    <div>
      <b>{getName(connector)}</b>
      <br />
      {error ? (
        <>
          <XCircleIcon /> {error.name ?? 'Error'}: {error.message}
        </>
      ) : connected ? (
        <>
          <CheckCircleIcon />
        </>
      ) : (
        <>Disconnected</>
      )}
    </div>
  );
}

function Connection({
  connector,
  hooks: { useChainId, useIsActivating, useError, useIsActive },
}: {
  connector: Connector;
  hooks: Web3ReactHooks;
}) {
  const currentChainId = useChainId();
  const isActivating = useIsActivating();
  const error = useError();
  const active = useIsActive();

  const [desiredChainId, setDesiredChainId] = useState<number>(-1);

  const setChainId = useCallback(
    (chainId: number) => {
      setDesiredChainId(chainId);
      if (chainId !== -1 && chainId !== currentChainId) {
        return connector.activate(getAddChainParameters(chainId));
      }
    },
    [setDesiredChainId, currentChainId, connector]
  );

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
      <Image src={metamaskLogo} height={20} width={20} />
      <div className="flex w-full justify-between">
        <ConnectorButtonText>{getName(connector)}</ConnectorButtonText>
        <ConnectorButtonText>{status()}</ConnectorButtonText>
      </div>
    </ConnectorButton>
  );
}

const ConnectModal = ({ modalOpen, setModalOpen }: { modalOpen: boolean; setModalOpen: (isOpen: boolean) => void }) => {
  return (
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
};

export default ConnectModal;
