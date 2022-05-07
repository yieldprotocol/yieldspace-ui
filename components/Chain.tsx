import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { Fragment } from 'react';
import tw from 'tailwind-styled-components';
import { useChainId } from 'wagmi/dist/declarations/src/hooks';
import { CHAINS } from '../config/chains';
import useNetworkSelect from '../hooks/useNetworkSelect';
import AssetLogo from './common/AssetLogo';

const NameWrap = tw.div`align-middle`;

type ButtonProps = {
  $active: boolean;
};

const Button = tw.button<ButtonProps>`${(p) =>
  p.$active
    ? 'dark:text-gray-50 text-gray-800'
    : 'dark:text-gray-400 text-gray-600'} flex gap-2 rounded-md items-center p-3`;

const Chain = () => {
  const chainId = useChainId();
  const { supportedChains, switchChain } = useNetworkSelect();

  if (!chainId) return null;

  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => (
        <>
          <Menu.Button className="h-full flex gap-2 items-center px-2 dark:bg-gray-700/50 border-[1px] dark:border-gray-700 border-gray-200 dark:text-gray-50 text-gray-800 rounded-md bg-gray-100 dark:hover:border-gray-600 hover:border-gray-300">
            <AssetLogo image="ETH" />
            <NameWrap>{CHAINS[chainId].name}</NameWrap>
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
            <Menu.Items className="w-full absolute mt-5 origin-top-right bg-gray-500/25 rounded-md shadow-md focus:outline-none">
              {Array.from(supportedChains.keys()).map((_chainId) => {
                const chainData = supportedChains.get(_chainId);
                return (
                  chainData && (
                    <Menu.Item key={_chainId}>
                      {({ active }) => (
                        <Button $active={active} onClick={() => switchChain(+_chainId)}>
                          <AssetLogo image="ETH" />
                          <NameWrap>{chainData.name}</NameWrap>
                        </Button>
                      )}
                    </Menu.Item>
                  )
                );
              })}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};

export default Chain;
