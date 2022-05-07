import { apiProvider, configureChains, getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { chain, createClient, WagmiProvider } from 'wagmi';

export default function Web3Provider({ children }) {
  const { chains, provider } = configureChains(
    [chain.mainnet, chain.goerli, chain.rinkeby, chain.arbitrum, chain.arbitrumRinkeby],
    [
      chain.arbitrumRinkeby ? apiProvider.alchemy(process.env.ALCHEMY_KEY) : apiProvider.infura(process.env.INFURA_KEY),
      apiProvider.fallback(),
    ]
  );

  const { connectors } = getDefaultWallets({
    appName: 'Yieldspace App',
    chains,
  });

  const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
  });

  return (
    <WagmiProvider client={wagmiClient}>
      <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
    </WagmiProvider>
  );
}
