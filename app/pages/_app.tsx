import { Provider } from 'react-redux';
import dynamic from 'next/dynamic';
import { ethers } from 'ethers';
import { Web3ReactProvider as Web3Provider } from '@web3-react/core';
import type { AppProps } from 'next/app';
import store from '../state/store';
import '../styles/globals.css';

export const DEFAULT_PROVIDER_NAME = 'fallback';

const Web3FallbackProvider = dynamic(() => import('../components/DefaultProvider'), { ssr: false });

export default function App({ Component, pageProps }: AppProps) {
  /* Init the signing web3 environment */
  function getLibrary(provider: ethers.providers.ExternalProvider) {
    const library = new ethers.providers.Web3Provider(provider);
    library.pollingInterval = 6000;
    return library;
  }

  function getFallbackLibrary(provider: any) {
    const library: ethers.providers.JsonRpcProvider = new ethers.providers.JsonRpcProvider(
      process.env[`REACT_APP_RPC_URL_${provider.chainId}`]
    );
    library.pollingInterval = 6000;
    return library;
  }

  return (
    <Provider store={store}>
      <Web3Provider getLibrary={getLibrary}>
        <Web3FallbackProvider getLibrary={getFallbackLibrary}>
          <Component {...pageProps} />
        </Web3FallbackProvider>
      </Web3Provider>
    </Provider>
  );
}
