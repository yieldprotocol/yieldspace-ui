import { getPriorityConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';
import { hooks as metaMaskHooks, metaMask } from '../connectors/metaMask';
import { hooks as walletConnectHooks, walletConnect } from '../connectors/walletConnect';

const useConnector = () => {
  const { usePriorityConnector, usePriorityChainId, usePriorityAccount, usePriorityENSName, usePriorityProvider } =
    getPriorityConnector([walletConnect as WalletConnect, walletConnectHooks], [metaMask as MetaMask, metaMaskHooks]);

  const connector = usePriorityConnector();
  const chainId = usePriorityChainId();
  const account = usePriorityAccount();
  const provider = usePriorityProvider();
  const ensName = usePriorityENSName(provider);
  const signer = provider?.getSigner(account);

  return { connector, chainId, account, provider, ensName, signer };
};

export default useConnector;
