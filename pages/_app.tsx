import { Provider } from 'react-redux';
import store from '../state/store';
import { AppProps } from 'next/dist/shared/lib/router/router';
import '../styles/globals.css';
import dynamic from 'next/dynamic';

const DynamicLayout = dynamic(() => import('../components/Layout'), { ssr: false });

const MyApp = ({ Component, pageProps }: AppProps) => (
  <Provider store={store}>
    <DynamicLayout>
      <Component {...pageProps} />
    </DynamicLayout>
  </Provider>
);

export default MyApp;
