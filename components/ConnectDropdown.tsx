import { FC, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import tw from 'tailwind-styled-components';
import useCopy from '../hooks/useCopy';
import { abbreviateHash } from '../utils/appUtils';
import useConnector from '../hooks/useConnector';
import { CHAINS, ExtendedChainInformation } from '../config/chains';
import { useColorTheme } from '../hooks/useColorTheme';

type ButtonProps = {
  $active: boolean;
};

const Button = tw.button<ButtonProps>`${(p) =>
  p.$active
    ? 'dark:text-gray-50 text-gray-800'
    : 'dark:text-gray-400 text-gray-600'} flex rounded-md items-center w-full px-2 py-2`;

const ConnectDropdown: FC<{ setModalOpen: (isOpen: boolean) => void }> = ({ setModalOpen }) => {
  const { theme, toggleTheme } = useColorTheme();
  const { account, ensName, chainId, connector } = useConnector();
  const { copied, copy } = useCopy(account!);
  const chainData = chainId ? (CHAINS[chainId] as ExtendedChainInformation) : undefined;
  const blockExplorer = chainData?.blockExplorerUrls![0];

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  if (!account) return null;

  return (
    <div>
      <Menu as="div" className="relative inline-block text-left">
        {({ open }) => (
          <>
            <Menu.Button className="inline-flex justify-between gap-2 align-middle w-full dark:bg-gray-500/25 px-4 py-2 dark:text-gray-50 text-gray-800 rounded-md hover:bg-gray-600/25 bg-gray-300">
              {ensName || abbreviateHash(account!)}
              <ChevronDownIcon className="my-auto w-5 h-5 dark:text-gray-50 text-gray-800" aria-hidden="true" />
            </Menu.Button>
            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="w-full absolute right-0 mt-5 origin-top-right bg-gray-500/25 rounded-md shadow-md focus:outline-none">
                <div className="px-1 py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Button
                        $active={active}
                        onClick={() => {
                          copy(account);
                        }}
                      >
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
                {blockExplorer && account && (
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a href={`${blockExplorer}/address/${account}`} target="_blank" rel="noreferrer">
                          <Button $active={active}>Open In Etherscan</Button>
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                )}
                <div className="px-1 py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Button onClick={toggleTheme} $active={active}>
                        {theme === 'light' ? 'Dark' : 'Light'} Mode
                      </Button>
                    )}
                  </Menu.Item>
                </div>
                <div className="px-1 py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Button $active={active} onClick={() => connector.deactivate()}>
                        Disconnect
                      </Button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  );
};

export default ConnectDropdown;
