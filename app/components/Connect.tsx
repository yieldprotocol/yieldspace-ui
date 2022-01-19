import { utils } from 'ethers';
import Image from 'next/image';
import type { Web3ReactHooks } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { Network } from '@web3-react/network';
import type { Connector } from '@web3-react/types';
import { useCallback, useState } from 'react';
import { CHAINS, getAddChainParameters, URLS } from '../config/chains';
import { connectors } from '../connectors';
import { useAppDispatch, useAppSelector } from 'state/hooks/general';
import tw from 'tailwind-styled-components';
import Modal from './Modal';
import { updateConnection } from 'state/actions/chain';
import useBalances from '../hooks/useBalances';
import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/solid';
import metamaskLogo from '../public/logos/metamask.png';
import { connected } from 'process';

const ConnectButton = tw.button`bg-primary-500/25 align-middle px-4 py-2 text-primary-500 rounded-md hover:bg-primary-600/25`;
const Inner = tw.div`p-2 space-y-2`;
const ConnectorButton = tw.button`w-full gap-4 bg-gray-500/25 align-middle px-4 py-3 text-primary-500 rounded-md hover:bg-gray-600/25 flex`;
const ConnectorButtonText = tw.span`align-middle text-gray-50`;

const getName = (connector: Connector) => {
  if (connector instanceof MetaMask) {
    return 'MetaMask';
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

function Accounts({ hooks: { useAccounts, useProvider, useENSNames } }: { hooks: Web3ReactHooks }) {
  const provider = useProvider();
  const accounts = useAccounts();
  const ENSNames = useENSNames(provider);

  const balances = useBalances(provider, accounts);

  return (
    <div>
      Accounts:
      {accounts === undefined
        ? ' -'
        : accounts.length === 0
        ? ' None'
        : accounts?.map((account, i) => (
            <ul key={account} style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <b>{ENSNames?.[i] ?? account}</b>
              {balances?.[i] ? ` (Ξ${utils.formatEther(balances[i])})` : null}
            </ul>
          ))}
    </div>
  );
}

function MetaMaskConnect({
  connector,
  hooks: { useChainId, useIsActivating, useError, useIsActive },
}: {
  connector: MetaMask;
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

function GenericConnect({
  connector,
  hooks: { useIsActivating, useError, useIsActive },
}: {
  connector: Connector;
  hooks: Web3ReactHooks;
}) {
  const isActivating = useIsActivating();
  const error = useError();

  const active = useIsActive();

  if (error) {
    return <button onClick={() => connector.activate()}>Try Again?</button>;
  } else if (active) {
    return (
      <button
        onClick={connector.deactivate ? () => connector.deactivate() : undefined}
        disabled={!connector.deactivate}
      >
        {connector.deactivate ? 'Disconnect' : 'Connected'}
      </button>
    );
  } else {
    return (
      <button onClick={isActivating ? undefined : () => connector.activate()} disabled={isActivating}>
        {isActivating ? 'Connecting...' : 'Connect'}
      </button>
    );
  }
}

function Connection({ connector, hooks }: { connector: Connector; hooks: Web3ReactHooks }) {
  return connector instanceof MetaMask ? (
    <MetaMaskConnect connector={connector} hooks={hooks} />
  ) : (
    <GenericConnect connector={connector} hooks={hooks} />
  );
}

const Connect = () => {
  const dispatch = useAppDispatch();
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  return (
    <>
      <ConnectButton onClick={() => setModalOpen(true)}>Connect Wallet</ConnectButton>
      <Modal isOpen={modalOpen} setIsOpen={setModalOpen}>
        <Inner>
          {connectors.map(([connector, hooks], i) => (
            <Connection connector={connector} hooks={hooks} key={i} />
          ))}
        </Inner>
      </Modal>
    </>
  );
};

export default Connect;
