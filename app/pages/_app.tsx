import '../styles/globals.css';
import { Provider } from 'react-redux';
import store from '../state/store';
import { AppProps } from 'next/dist/shared/lib/router/router';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
};

export default MyApp;
