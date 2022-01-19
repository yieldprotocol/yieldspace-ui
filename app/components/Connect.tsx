import { utils } from 'ethers';

import type { Web3ReactHooks } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { Network } from '@web3-react/network';
import type { Connector } from '@web3-react/types';
import { useCallback, useState } from 'react';
import { CHAINS, getAddChainParameters, URLS } from '../config/chains';
import { connectors } from '../connectors';

import Image from 'next/image';
import { useAppDispatch, useAppSelector } from 'state/hooks/general';
import tw from 'tailwind-styled-components';
import Modal from './Modal';
import { updateConnection } from 'state/actions/chain';
import useBalances from '../hooks/useBalances';

const ConnectButton = tw.button`bg-primary-500/25 align-middle px-4 py-2 text-primary-500 rounded-md hover:bg-primary-600/25`;
const Inner = tw.div`p-2 space-y-2`;
const ConnectionButton = tw.button`w-full gap-4 bg-gray-500/25 align-middle px-4 py-3 text-primary-500 rounded-md hover:bg-gray-600/25  flex`;

function getName(connector: Connector) {
  if (connector instanceof MetaMask) {
    return 'MetaMask';
  } else if (connector instanceof Network) {
    return 'Network';
  } else {
    return 'Unknown';
  }
}

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
          🛑 {error.name ?? 'Error'}: {error.message}
        </>
      ) : connected ? (
        <>✅ Connected</>
      ) : (
        <>⚠️ Disconnected</>
      )}
    </div>
  );
}

function ChainId({ hooks: { useChainId } }: { hooks: Web3ReactHooks }) {
  const chainId = useChainId();

  return <div>Chain Id: {chainId ? <b>{chainId}</b> : '-'}</div>;
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

function MetaMaskSelect({ chainId, setChainId }: { chainId: number; setChainId?: (chainId: number) => void }) {
  return (
    <label>
      Chain:{' '}
      <select
        value={`${chainId}`}
        onChange={
          setChainId
            ? (event) => {
                setChainId(Number(event.target.value));
              }
            : undefined
        }
        disabled={!setChainId}
      >
        <option value={-1}>Default</option>
        {Object.keys(URLS).map((chainId) => (
          <option key={chainId} value={chainId}>
            {CHAINS[Number(chainId)].name}
          </option>
        ))}
      </select>
    </label>
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

  if (error) {
    return (
      <>
        <MetaMaskSelect chainId={desiredChainId} setChainId={setChainId} />
        <br />
        <button
          onClick={() => connector.activate(desiredChainId === -1 ? undefined : getAddChainParameters(desiredChainId))}
        >
          Try Again?
        </button>
      </>
    );
  } else if (active) {
    return (
      <>
        <MetaMaskSelect chainId={desiredChainId === -1 ? -1 : currentChainId} setChainId={setChainId} />
        <br />
        <button disabled>Connected</button>
      </>
    );
  } else {
    return (
      <>
        <MetaMaskSelect chainId={desiredChainId} setChainId={isActivating ? undefined : setChainId} />
        <br />
        <button
          onClick={
            isActivating
              ? undefined
              : () => connector.activate(desiredChainId === -1 ? undefined : getAddChainParameters(desiredChainId))
          }
          disabled={isActivating}
        >
          {isActivating ? 'Connecting...' : 'Connect'}
        </button>
      </>
    );
  }
}

function NetworkSelect({ chainId, setChainId }: { chainId: number; setChainId?: (chainId: number) => void }) {
  return (
    <label>
      Chain:{' '}
      <select
        value={`${chainId}`}
        onChange={
          setChainId
            ? (event) => {
                setChainId(Number(event.target.value));
              }
            : undefined
        }
        disabled={!setChainId}
      >
        {Object.keys(URLS).map((chainId) => (
          <option key={chainId} value={chainId}>
            {CHAINS[Number(chainId)].name}
          </option>
        ))}
      </select>
    </label>
  );
}

function NetworkConnect({
  connector,
  hooks: { useChainId, useError, useIsActive },
}: {
  connector: Network;
  hooks: Web3ReactHooks;
}) {
  const currentChainId = useChainId();
  const error = useError();
  const active = useIsActive();

  const [desiredChainId, setDesiredChainId] = useState<number>(1);

  const setChainId = useCallback(
    (chainId: number) => {
      setDesiredChainId(chainId);
      return connector.activate(chainId);
    },
    [setDesiredChainId, connector]
  );

  if (error) {
    return (
      <>
        <NetworkSelect chainId={desiredChainId} setChainId={setChainId} />
        <br />
        <button onClick={() => connector.activate(desiredChainId)}>Try Again?</button>
      </>
    );
  } else if (active) {
    return (
      <>
        <NetworkSelect chainId={currentChainId} setChainId={setChainId} />
        <br />
        <button disabled>Connected</button>
      </>
    );
  } else {
    // because network connector connects eagerly, we should only see this when activating
    return (
      <>
        <NetworkSelect chainId={desiredChainId} />
        <br />
        <button disabled>Connecting...</button>
      </>
    );
  }
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
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                width: '20rem',
                padding: '1rem',
                margin: '1rem',
                overflow: 'auto',
                border: '1px solid',
                borderRadius: '1rem',
              }}
            >
              <div>
                <Status connector={connector} hooks={hooks} />
                <br />
                <ChainId hooks={hooks} />
                <Accounts hooks={hooks} />
                <br />
              </div>
              <Connection connector={connector} hooks={hooks} />
            </div>
          ))}
        </Inner>
      </Modal>
    </>
  );
};

export default Connect;
