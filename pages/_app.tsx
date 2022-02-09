import { AppProps } from 'next/dist/shared/lib/router/router';
import Script from 'next/script';
import '../styles/globals.css';
import dynamic from 'next/dynamic';

const DynamicLayout = dynamic(() => import('../components/Layout'), { ssr: false });

const MyApp = ({ Component, pageProps }: AppProps) => (
  <DynamicLayout>
    <Script type="text/javascript" strategy="beforeInteractive" src="/scripts/themeScript.js" />
    <Component {...pageProps} />
  </DynamicLayout>
);

export default MyApp;
