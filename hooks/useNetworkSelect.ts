import { useWeb3React } from '@web3-react/core';
import { WalletConnect } from '@web3-react/walletconnect';
import { useCallback, useState } from 'react';
import { CHAINS, ExtendedChainInformation, getAddChainParameters } from '../config/chains';

const useNetworkSelect = () => {
  const { chainId, connector } = useWeb3React();

  const supportedChainIds = [1, 4];
  const supportedChains = Object.keys(CHAINS)
    .filter((_chainId) => supportedChainIds.includes(+_chainId))
    .filter((_chainId) => +_chainId !== chainId)
    .reduce((acc, key) => acc.set(key, CHAINS[key]), new Map()) as Map<string, ExtendedChainInformation>;

  const [desiredChainId, setDesiredChainId] = useState<number>(chainId ?? -1);

  const switchChain = useCallback(
    async (_desiredChainId: number) => {
      setDesiredChainId(_desiredChainId);
      // if we're already connected to the desired chain, return
      if (_desiredChainId === chainId) return;
      // if they want to connect to the default chain and we're already connected, return
      if (_desiredChainId === -1 && chainId !== undefined) return;

      connector instanceof WalletConnect
        ? await connector.activate(desiredChainId === -1 ? undefined : _desiredChainId)
        : await connector.activate(desiredChainId === -1 ? undefined : getAddChainParameters(_desiredChainId));
    },
    [chainId, connector, desiredChainId]
  );

  return { supportedChains, switchChain };
};

export default useNetworkSelect;
