import { apiProvider, configureChains, getDefaultWallets, RainbowKitProvider, Theme } from '@rainbow-me/rainbowkit';
import { chain, createClient, WagmiProvider } from 'wagmi';

export default function Web3Provider({ children }) {
  const theme = useappsele;
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

  const myTheme = merge(darkTheme(), {
    colors: {
      accentColor:
        'linear-gradient(135deg, rgba(247, 149, 51, 0.5), rgba(243, 112, 85, 0.5), rgba(239, 78, 123, 0.5), rgba(161, 102, 171, 0.5), rgba(80, 115, 184, 0.5), rgba(16, 152, 173, 0.5), rgba(7, 179, 155, 0.5), rgba(111, 186, 130, 0.5));',
    },
  } as Theme);

  const theme: Theme = {
    colors: {
      accentColor: '',
    },
  };

  return (
    <WagmiProvider client={wagmiClient}>
      <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
    </WagmiProvider>
  );
}
