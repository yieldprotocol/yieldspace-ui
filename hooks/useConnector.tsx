import { useEffect } from 'react';
import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';
import { hooks as metaMaskHooks, metaMask } from '../connectors/metaMask';
import { hooks as walletConnectHooks, walletConnect } from '../connectors/walletConnect';

const connectors: [MetaMask | WalletConnect, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
];

export default function Web3Provider({ children }) {
  // attempt to connect to metamask eagerly on mount
  useEffect(() => {
    void metaMask.connectEagerly();
  }, []);

  return <Web3ReactProvider connectors={connectors}>{children}</Web3ReactProvider>;
}
