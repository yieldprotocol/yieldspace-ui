import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { SUPPORTED_CHAIN_IDS, SUPPORTED_RPC_URLS } from './chainData';

export const CONNECTOR_INFO = new Map<string, { displayName: string; image: any }>();
CONNECTOR_INFO.set('metamask', { displayName: 'Metamask', image: '/../public/logos/metamask.png' });
CONNECTOR_INFO.set('ledgerWithMetamask', {
  displayName: 'Hardware Wallet (with Metamask)',
  image: '/../public/logos/ledger.svg',
});
CONNECTOR_INFO.set('ledger', { displayName: 'Ledger', image: '/../public/logos/ledger.svg' });
CONNECTOR_INFO.set('walletconnect', { displayName: 'WalletConnect', image: '/../public/logos/walletconnect.svg' });

/* use cached connector as initial_injected connection or metamask if null */
export const INIT_INJECTED = 'metamask';

export const CONNECTORS = new Map();

CONNECTORS.set(
  'metamask',
  new InjectedConnector({
    supportedChainIds: SUPPORTED_CHAIN_IDS,
  })
);

CONNECTORS.set(
  'walletconnect',
  new WalletConnectConnector({
    rpc: SUPPORTED_RPC_URLS,
    bridge: 'https://bridge.walletconnect.org',
    qrcode: true,
  })
);

CONNECTORS.set(
  'ledgerWithMetamask',
  new InjectedConnector({
    supportedChainIds: SUPPORTED_CHAIN_IDS,
  })
);
