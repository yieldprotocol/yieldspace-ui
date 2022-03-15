import { XIcon } from '@heroicons/react/solid';
import { ToastContainer } from 'react-toastify';
import { useColorTheme } from '../../hooks/useColorTheme';
import 'react-toastify/dist/ReactToastify.css';

const Toasty = () => {
  const { theme } = useColorTheme();
  return (
    <ToastContainer
      position="bottom-right"
      pauseOnHover
      closeOnClick
      toastStyle={{ background: theme === 'light' ? '#e4e4e7' : '#18181b' }}
      closeButton={({ closeToast }) => (
        <XIcon height="1rem" width="1rem" color={theme === 'dark' ? '#e4e4e7' : '#18181b'} onClick={closeToast} />
      )}
    />
  );
};

export default Toasty;
