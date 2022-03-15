import { XIcon } from '@heroicons/react/solid';
import { ToastContainer } from 'react-toastify';
import { useColorTheme } from '../../hooks/useColorTheme';
import 'react-toastify/dist/ReactToastify.css';

const Toasty = () => {
  const { theme } = useColorTheme();

  return (
    <ToastContainer
      toastClassName={() =>
        'bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-50 relative flex p-2 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer'
      }
      bodyClassName={() => 'flex text-md font-med p-3'}
      position="bottom-right"
      pauseOnHover
      closeOnClick
      // toastStyle={{ background: theme === 'light' ? '#e4e4e7' : '#18181b' }}
      closeButton={({ closeToast }) => (
        <XIcon height="1rem" width="1rem" color={theme === 'dark' ? '#e4e4e7' : '#18181b'} onClick={closeToast} />
      )}
    />
  );
};

export default Toasty;
