import { AppProps } from 'next/dist/shared/lib/router/router';
import '../styles/globals.css';
import dynamic from 'next/dynamic';
import Toasty from '../components/common/Toasty';

const DynamicLayout = dynamic(() => import('../components/Layout'), { ssr: false });
const DynamicWeb3Provider = dynamic(() => import('../hooks/useConnector'), { ssr: false });

const MyApp = ({ Component, pageProps }: AppProps) => (
  <DynamicWeb3Provider>
    <DynamicLayout>
      <Toasty />
      <Component {...pageProps} />
    </DynamicLayout>
  </DynamicWeb3Provider>
);

export default MyApp;
