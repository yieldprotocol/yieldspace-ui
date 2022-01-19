import { FC, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import Link from './Link';
import { ChevronDownIcon } from '@heroicons/react/solid';
import tw from 'tailwind-styled-components';
import useCopy from '../hooks/useCopy';
import { useAppSelector } from 'state/hooks/general';
import { abbreviateHash } from 'utils/appUtils';

interface ButtonProps {
  $active: boolean;
}

const Button = tw.button<ButtonProps>`${(p) =>
  p.$active ? 'text-gray-50' : 'text-gray-400'} flex rounded-md items-center w-full px-2 py-2`;

const Dropdown: FC<{ setModalOpen: (isOpen: boolean) => void }> = ({ setModalOpen }) => {
  const {
    connection: { chainId, account },
  } = useAppSelector(({ chain }) => chain);
  const { copied, copy } = useCopy(account);

  const handleModalOpen = () => {
    console.log('opening modal');
    setModalOpen(true);
  };
  return (
    <div>
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="inline-flex justify-center align-middle w-full bg-gray-500/25 px-4 py-2 text-gray-50 rounded-md hover:bg-gray-600/25">
          {abbreviateHash(account)}
          <ChevronDownIcon className="w-5 h-5 ml-2 -mr-1 text-gray-50" aria-hidden="true" />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="w-full absolute right-0 mt-5 origin-top-right bg-gray-500/25 rounded-md shadow-md focus:outline-none ">
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <Button $active={active} onClick={copy}>
                    {copied ? 'Address Copied' : 'Copy Address'}
                  </Button>
                )}
              </Menu.Item>
            </div>
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <Button onClick={handleModalOpen} $active={active}>
                    Change Wallet
                  </Button>
                )}
              </Menu.Item>
            </div>
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  // <Link href={`${explorer}/${account}`} target="_blank">
                  <Button $active={active}>Open In Etherscan</Button>
                  // </Link>
                )}
              </Menu.Item>
            </div>
            {/* <div className="px-1 py-1">
              <Menu.Item>{({ active }) => <Button $active={active}>Disconnect</Button>}</Menu.Item>
            </div> */}
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default Dropdown;
