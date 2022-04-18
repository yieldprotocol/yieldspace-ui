import { useWeb3React } from '@web3-react/core';
import { WalletConnect } from '@web3-react/walletconnect';
import { useCallback } from 'react';
import { CHAINS, ExtendedChainInformation, getAddChainParameters, SUPPORTED_CHAIN_IDS } from '../config/chains';

const useNetworkSelect = () => {
  const { chainId, connector } = useWeb3React();

  const supportedChains = Object.keys(CHAINS)
    .filter((_chainId) => SUPPORTED_CHAIN_IDS.includes(+_chainId))
    .filter((_chainId) => +_chainId !== chainId)
    .reduce((acc, key) => acc.set(key, CHAINS[key]), new Map()) as Map<string, ExtendedChainInformation>;

  const switchChain = useCallback(
    async (_desiredChainId: number) => {
      // if we're already connected to the desired chain, return
      if (_desiredChainId === chainId) return;
      // if they want to connect to the default chain and we're already connected, return
      if (_desiredChainId === -1 && chainId !== undefined) return;

      connector instanceof WalletConnect
        ? await connector.activate(_desiredChainId === -1 ? undefined : _desiredChainId)
        : await connector.activate(_desiredChainId === -1 ? undefined : getAddChainParameters(_desiredChainId));
    },
    [chainId, connector]
  );

  return { supportedChains, switchChain };
};

export default useNetworkSelect;
