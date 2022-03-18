import { toast } from 'react-toastify';
import tw from 'tailwind-styled-components';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/solid';

const Body = tw.div`flex gap-3 p-2 items-center align-middle`;
const Text = tw.div`text-sm`;
const Spinner = tw.div`spinner-border animate-spin h-5 w-5 border-5 rounded-full border-primary-200 border-t-secondary-400`;

const Inner = ({ msg, link = undefined }: { msg: string; link: string | undefined }) =>
  link ? (
    <a href={link}>
      <Text>{msg}</Text>
    </a>
  ) : (
    <Text>{msg}</Text>
  );

const Pending = ({ msg, link = undefined }: { msg: string; link: string | undefined }) => (
  <Body>
    {/* <Spinner /> */}
    <Inner msg={msg} link={link} />
  </Body>
);

const Success = ({ msg, link = undefined }: { msg: string; link: string | undefined }) => (
  <Body>
    <CheckCircleIcon color="#10b981" height="25px" width="25px" />
    <Inner msg={msg} link={link} />
  </Body>
);

const Error = ({ msg, link }: { msg: string; link: string | undefined }) => (
  <Body>
    <ExclamationCircleIcon color="#ef4444" height="25px" width="25px" />
    <Inner msg={msg} link={link} />
  </Body>
);

const useToasty = () => {
  const toasty = (promise: () => Promise<void>, msg: string, link: string | undefined) => {
    toast.promise(promise, {
      pending: {
        render() {
          return <Pending msg={msg} link={link} />;
        },
        icon: true,
      },
      success: {
        render() {
          return <Success msg={msg} link={link} />;
        },
        icon: false,
      },
      error: {
        render() {
          return <Error msg={msg} link={link} />;
        },
        icon: false,
      },
    });
  };

  return { toasty };
};

export default useToasty;
