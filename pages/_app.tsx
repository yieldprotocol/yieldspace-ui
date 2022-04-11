import { AppProps } from 'next/dist/shared/lib/router/router';
import '../styles/globals.css';
import dynamic from 'next/dynamic';
import Toasty from '../components/common/Toasty';
import Web3Provider from '../hooks/useConnector';

const DynamicLayout = dynamic(() => import('../components/Layout'), { ssr: false });

const MyApp = ({ Component, pageProps }: AppProps) => (
  <Web3Provider>
    <DynamicLayout>
      <Toasty />
      <Component {...pageProps} />
    </DynamicLayout>
  </Web3Provider>
);

export default MyApp;
