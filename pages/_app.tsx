import { AppProps } from 'next/dist/shared/lib/router/router';
import '../styles/globals.css';
import dynamic from 'next/dynamic';

const DynamicLayout = dynamic(() => import('../components/Layout'), { ssr: false });

const MyApp = ({ Component, pageProps }: AppProps) => (
  <DynamicLayout>
    <Component {...pageProps} />
  </DynamicLayout>
);

export default MyApp;
