import { getPriorityConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
// import { WalletConnect } from '@web3-react/walletconnect'
import { hooks as metaMaskHooks, metaMask } from '../connectors/metaMask';
// import { hooks as walletConnectHooks, walletConnect } from '../connectors/walletConnect'

const useConnector = () => {
  // console.log('fetching connector');
  const { usePriorityConnector, usePriorityChainId, usePriorityAccount, usePriorityENSName, usePriorityProvider } =
    getPriorityConnector(
      [metaMask as MetaMask, metaMaskHooks]
      //   [walletConnect, walletConnectHooks],
    );

  const chainId = usePriorityChainId();
  const account = usePriorityAccount();
  const connector = usePriorityConnector();
  const provider = usePriorityProvider();
  const ensName = usePriorityENSName(provider);

  return { chainId, account, connector, provider, ensName };
};

export default useConnector;
