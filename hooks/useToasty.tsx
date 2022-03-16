import { toast } from 'react-toastify';
import tw from 'tailwind-styled-components';
import { CheckCircleIcon } from '@heroicons/react/solid';
import { useEffect } from 'react';

const Body = tw.div`flex gap-3 p-2 items-center align-middle`;
const Text = tw.div`text-sm`;
const Spinner = tw.div`spinner-border animate-spin h-5 w-5 border-5 rounded-full border-primary-200 border-t-secondary-400`;

const Pending = ({ msg }: { msg: string }) => (
  <Body>
    {/* <Spinner /> */}
    <Text>{msg}</Text>
  </Body>
);

const Success = ({ msg }: { msg: string }) => (
  <Body>
    <CheckCircleIcon color="#10b981" height="30px" width="30px" />
    <Text>{msg}</Text>
  </Body>
);

const useToasty = () => {
  const toasty = (promise: () => Promise<void>, msg: string) => {
    toast.promise(promise, {
      pending: {
        render() {
          return <Pending msg={msg} />;
        },
        icon: true,
      },
      success: {
        render() {
          return <Success msg={msg} />;
        },
        icon: false,
      },
    });
  };

  return { toasty };
};

export default useToasty;
