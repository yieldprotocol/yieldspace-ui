import { Web3Provider } from '@ethersproject/providers';
import { getPriorityConnector, Web3ReactHooks } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import type { Connector } from '@web3-react/types';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { CHAINS } from '../config/chains';
// import { WalletConnect } from '@web3-react/walletconnect'
import { hooks as metaMaskHooks, metaMask } from '../connectors/metaMask';
// import { hooks as walletConnectHooks, walletConnect } from '../connectors/walletConnect'

function getName(connector: Connector) {
  if (connector instanceof MetaMask) return 'MetaMask';
  //   if (connector instanceof WalletConnect) return 'WalletConnect'
  return 'Unknown';
}

const useConnector = () => {
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

  // useEffect(() => {
  //   if (!provider) {
  //     const defaultProvider = getDefaultProvider();
  //     setConnectorState({ chainId: 1, account: null, ensName: null, connector: null, provider: defaultProvider });
  //   } else {
  //     setConnectorState({ chainId, account, ensName, connector, provider });
  //   }
  // }, [provider, chainId, account, connector, ensName]);

  return { chainId, account, connector, provider, ensName };
};

const getDefaultProvider = (chainId: number) => new ethers.providers.JsonRpcProvider(CHAINS[chainId].urls[0]);

export default useConnector;
