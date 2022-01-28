import { Provider } from 'react-redux';
import store from '../state/store';
import { AppProps } from 'next/dist/shared/lib/router/router';
import '../styles/globals.css';
import dynamic from 'next/dynamic';

const Layout_ = dynamic(() => import('../components/Layout'), { ssr: false });

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <Provider store={store}>
      <Layout_>
        <Component {...pageProps} />
      </Layout_>
    </Provider>
  );
};

export default MyApp;
