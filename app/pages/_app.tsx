import { Provider } from 'react-redux';
import store from '../state/store';
import { AppProps } from 'next/dist/shared/lib/router/router';
import Layout from '../components/Layout';
import '../styles/globals.css';

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
