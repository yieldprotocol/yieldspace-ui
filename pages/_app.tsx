import { AppProps } from 'next/dist/shared/lib/router/router';
import '../styles/globals.css';
import dynamic from 'next/dynamic';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useColorTheme } from '../hooks/useColorTheme';
import { XIcon } from '@heroicons/react/solid';

const DynamicLayout = dynamic(() => import('../components/Layout'), { ssr: false });
const DynamicGlobalProvider = dynamic(() => import('../hooks/GlobalContext'), { ssr: false });

const MyApp = ({ Component, pageProps }: AppProps) => {
  const { theme } = useColorTheme();

  return (
    <DynamicGlobalProvider>
      <DynamicLayout>
        <ToastContainer
          position="bottom-right"
          pauseOnHover
          closeOnClick
          toastStyle={{ background: theme === 'light' ? '#e4e4e7' : '#18181b' }}
          closeButton={<XIcon height="1rem" width="1rem" color={theme === 'dark' ? '#e4e4e7' : '#18181b'} />}
        />
        <Component {...pageProps} />
      </DynamicLayout>
    </DynamicGlobalProvider>
  );
};

export default MyApp;
