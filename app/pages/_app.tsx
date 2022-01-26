import { Provider } from 'react-redux';
import store from '../state/store';
import { AppProps } from 'next/dist/shared/lib/router/router';
import '../styles/globals.css';
import Layout from '../components/Layout';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <Provider store={store}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Provider>
  );
};

export default MyApp;
