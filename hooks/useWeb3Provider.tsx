import {
  apiProvider,
  configureChains,
  darkTheme,
  getDefaultWallets,
  midnightTheme,
  RainbowKitProvider,
  Theme,
} from '@rainbow-me/rainbowkit';
import { Chain, chain, createClient, WagmiProvider } from 'wagmi';
import merge from 'lodash.merge';
import { useColorTheme } from './useColorTheme';
import { URLS } from '../config/chains';

export default function Web3Provider({ children }) {
  const { theme: colorTheme } = useColorTheme();
  const { chains, provider } = configureChains(
    [chain.mainnet, chain.goerli, chain.rinkeby, chain.arbitrum, chain.arbitrumRinkeby],
    [
      apiProvider.jsonRpc((_chain: Chain) => ({
        rpcUrl: URLS[_chain.id][0],
      })),
    ]
  );

  console.log('🦄 ~ file: useWeb3Provider.tsx ~ line 17 ~ Web3Provider ~ provider', provider);
  const { connectors } = getDefaultWallets({
    appName: 'Yieldspace App',
    chains,
  });

  const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
  });

  const theme = merge(colorTheme === 'dark' ? darkTheme() : undefined, {
    colors: {
      accentColor:
        'linear-gradient(135deg, rgba(247, 149, 51, 0.5), rgba(243, 112, 85, 0.5), rgba(239, 78, 123, 0.5), rgba(161, 102, 171, 0.5), rgba(80, 115, 184, 0.5), rgba(16, 152, 173, 0.5), rgba(7, 179, 155, 0.5), rgba(111, 186, 130, 0.5));',
      // connectButtonInnerBackground: '#0000',
      // accentColorForeground: '#00000',
    },

    fonts: { body: 'inter' },
    radii: {
      actionButton: '.75rem',
      connectButton: '.75rem',
      menuButton: '.75rem',
      modal: '.75rem',
      modalMobile: '.75rem',
    },
  } as Theme);

  return (
    <WagmiProvider client={wagmiClient}>
      <RainbowKitProvider chains={chains} theme={theme}>
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
