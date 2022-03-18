import { AppProps } from 'next/dist/shared/lib/router/router';
import '../styles/globals.css';
import dynamic from 'next/dynamic';
import Toasty from '../components/common/Toasty';

const DynamicLayout = dynamic(() => import('../components/Layout'), { ssr: false });

const MyApp = ({ Component, pageProps }: AppProps) => (
  <DynamicLayout>
    <Toasty />
    <Component {...pageProps} />
  </DynamicLayout>
);

export default MyApp;
