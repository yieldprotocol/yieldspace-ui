import { AppProps } from 'next/dist/shared/lib/router/router';
import '../styles/globals.css';
import dynamic from 'next/dynamic';
import Script from 'next/script';

const DynamicLayout = dynamic(() => import('../components/Layout'), { ssr: false });

const MyApp = ({ Component, pageProps }: AppProps) => (
  <DynamicLayout>
    <Script id="theme-script" src="/themeScript.js" strategy="beforeInteractive" />
    <Component {...pageProps} />
  </DynamicLayout>
);

export default MyApp;
