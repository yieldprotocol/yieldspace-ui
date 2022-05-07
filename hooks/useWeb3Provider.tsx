import {
  apiProvider,
  configureChains,
  darkTheme,
  getDefaultWallets,
  RainbowKitProvider,
  Theme,
} from '@rainbow-me/rainbowkit';
import { chain, createClient, WagmiProvider } from 'wagmi';
import merge from 'lodash.merge';

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

  const theme = merge(darkTheme(), {
    colors: {
      accentColor:
        'linear-gradient(135deg, rgba(247, 149, 51, 0.5), rgba(243, 112, 85, 0.5), rgba(239, 78, 123, 0.5), rgba(161, 102, 171, 0.5), rgba(80, 115, 184, 0.5), rgba(16, 152, 173, 0.5), rgba(7, 179, 155, 0.5), rgba(111, 186, 130, 0.5));',
    },
    fonts: { body: 'inter' },
  } as Theme);

  return (
    <WagmiProvider client={wagmiClient}>
      <RainbowKitProvider chains={chains} theme={theme}>
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
