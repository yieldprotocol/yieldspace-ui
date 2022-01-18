import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector';
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from '@web3-react/walletconnect-connector';

import { NetworkConnector } from '@web3-react/network-connector';
import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { useCachedState } from './generalHooks';
import { CHAIN_INFO, SUPPORTED_RPC_URLS } from '../config/chainData';
import { CONNECTORS, CONNECTOR_INFO, INIT_INJECTED } from '../config/connectors';
import { clearCachedItems } from '../utils/appUtils';
import { DEFAULT_PROVIDER_NAME } from 'pages/_app';
import { useAppDispatch } from 'state/hooks/general';
import { updateConnection } from 'state/actions/chain';

const NO_BROWSER_EXT =
  'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.';
const UNSUPPORTED_NETWORK = 'Your Wallet or Browser is connected to an unsupported network.';
const UNAUTHORISED_SITE = 'Please authorize this website to access your Ethereum account.';
const UNKNOWN_ERROR = 'An unknown error occurred. Check the console for more details.';

export const useConnection = () => {
  const dispatch = useAppDispatch();
  const [tried, setTried] = useState<boolean>(false);

  const [currentChainInfo, setCurrentChainInfo] = useState<any>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [fallbackErrorMessage, setFallbackErrorMessage] = useState<string | undefined>(undefined);

  /* CACHED VARIABLES */
  const [lastChainId, setLastChainId] = useCachedState('lastChainId', 1);
  const [connectionName, setConnectionName] = useCachedState('connectionName', '');

  const primaryConnection = useWeb3React<ethers.providers.Web3Provider>();
  const { connector, library: provider, chainId, account, activate, deactivate, active } = primaryConnection;

  const fallbackConnection = useWeb3React<ethers.providers.JsonRpcProvider>(DEFAULT_PROVIDER_NAME);
  const { library: fallbackProvider, chainId: fallbackChainId, activate: fallbackActivate } = fallbackConnection;

  /* extra hooks */
  const { handleErrorMessage } = useWeb3Errors();
  useInactiveListener(); // inactive listener for when a wallet is available, but not connected.

  const isConnected = (connection: string) => CONNECTORS.get(connection) === connector;
  const disconnect = () => connector && deactivate();

  const connect = useCallback(
    (connection: string) => {
      setErrorMessage(undefined);
      activate(
        CONNECTORS.get(connection),
        (e: Error) => {
          setErrorMessage(handleErrorMessage(e));
          setTried(true); // tried, failed, move on.
        },
        false
      ).then((x) => {
        setConnectionName(connection);
      });
    },
    [activate, handleErrorMessage, setConnectionName]
  );

  /**
   * FIRST STEP > Try to connect automatically to an injected provider on first load
   * */
  useEffect(() => {
    if (!tried && !active) {
      setErrorMessage(undefined);
      CONNECTORS.get(INIT_INJECTED)
        .isAuthorized()
        .then((isAuthorized: boolean) => {
          if (isAuthorized) {
            connect(INIT_INJECTED);
          } else setTried(true); // not authorsied, move on
        });
    }
    /* if active, set tried to true */
    !tried && active && setTried(true);
  }, [activate, active, connect, handleErrorMessage, tried]);

  /*
      SETTTING THE FALLBACK CHAINID >
      Watch the chainId for changes (most likely instigated by metamask),
      and change the FALLBACK provider accordingly.
      NOTE: Currently, there is no way to change the fallback provider manually, but the last chainId is cached.
  */
  useEffect(() => {
    /* Case: Auto Connection FAILURE > Set the fallback connector to the lastChainId */
    if (tried && !chainId) {
      console.log('Connecting fallback Provider to the default network');
      setFallbackErrorMessage(undefined);
      fallbackActivate(
        new NetworkConnector({
          urls: SUPPORTED_RPC_URLS,
          defaultChainId: lastChainId,
        }),
        (e: Error) => {
          setFallbackErrorMessage(handleErrorMessage(e));
        },
        false
      );
    }
    /* Case: Auto Connection SUCCESS > set the fallback connector to the same as the chainId */
    if (tried && chainId) {
      console.log('Connecting fallback Provider to the same network as connected wallet');
      setFallbackErrorMessage(undefined);
      fallbackActivate(
        new NetworkConnector({
          urls: SUPPORTED_RPC_URLS,
          defaultChainId: chainId,
        }),
        (e: Error) => {
          setFallbackErrorMessage(handleErrorMessage(e));
        },
        false
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tried, chainId, fallbackActivate, lastChainId]);

  /* Watch and track the connector currently being activated */
  const [activatingConnector, setActivatingConnector] = useState<any>();
  useEffect(() => {
    activatingConnector && activatingConnector === connector && setActivatingConnector(undefined);
  }, [activatingConnector, connector]);

  useEffect(() => {
    /* this is only for walletConnect to work */
    (window as any).global = window;
    // eslint-disable-next-line global-require
    (window as any).global.Buffer = (window as any).global.Buffer || require('buffer').Buffer;
  }, []);

  /* handle chainId changes */
  useEffect(() => {
    fallbackChainId && setCurrentChainInfo(CHAIN_INFO.get(fallbackChainId));
    if (fallbackChainId && lastChainId && fallbackChainId !== lastChainId) {
      clearCachedItems(['lastChainId', 'connectionName']);
      setLastChainId(fallbackChainId);
      // eslint-disable-next-line no-restricted-globals
      location.reload();
    }
  }, [fallbackChainId, lastChainId, setLastChainId]);

  useEffect(() => {
    dispatch(
      updateConnection({
        provider,
        chainId,
        fallbackProvider,
        fallbackChainId,
        account,
        connectionName,
      })
    );
  }, [provider, chainId, fallbackProvider, fallbackChainId, account, connectionName]);

  return {
    connectionState: {
      /* constants */
      CONNECTORS,
      CHAIN_INFO,
      CONNECTOR_INFO,

      /* connections */
      connectionName,
      connector,
      provider,
      fallbackProvider,
      chainId,
      fallbackChainId,
      lastChainId,

      currentChainInfo,
      errorMessage,
      fallbackErrorMessage,

      account,
      active,
      activatingConnector,
    },

    connectionActions: {
      connect,
      disconnect,
      isConnected,
    },
  };
};

// For better error handling */
const useWeb3Errors = () => {
  const handleErrorMessage = (error: Error) => {
    if (error instanceof NoEthereumProviderError) {
      // eslint-disable-next-line no-console
      console.log(NO_BROWSER_EXT);
      return NO_BROWSER_EXT;
    }
    if (error instanceof UnsupportedChainIdError) {
      // eslint-disable-next-line no-console
      console.log(UNSUPPORTED_NETWORK);
      return UNSUPPORTED_NETWORK;
    }
    if (error instanceof UserRejectedRequestErrorInjected || error instanceof UserRejectedRequestErrorWalletConnect) {
      return UNAUTHORISED_SITE;
    }
    // eslint-disable-next-line no-console
    console.error(error);
    return UNKNOWN_ERROR;
  };
  return { handleErrorMessage };
};

const useInactiveListener = (suppress: boolean = false) => {
  const { active, error, activate, chainId: _chainId } = useWeb3React();
  const [lastChainId, setLastChainId] = useCachedState('lastChainId', null);

  // eslint-disable-next-line consistent-return
  useEffect((): any => {
    const { ethereum } = window as any;
    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleConnect = () => {
        if (lastChainId !== _chainId && active) {
          console.log('Handling CONNECT');
        }
      };

      const handleAccountsChanged = (accounts: string[]) => {
        console.log('Handling ACCOUNT CHANGED', accounts);
      };

      const handleChainChanged = (chainId: string) => {
        console.log('CHAIN CHANGED in the background with payload: ', chainId);
        setLastChainId(parseInt(chainId, 16));
        // eslint-disable-next-line no-restricted-globals
        location.reload();
      };

      ethereum.on('connect', handleConnect);
      ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('connect', handleConnect);
          ethereum.removeListener('chainChanged', handleChainChanged);
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [active, error, suppress, activate, _chainId, lastChainId]);
};
