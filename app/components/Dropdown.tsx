import { FC, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import tw from 'tailwind-styled-components';

interface ButtonProps {
  $active: boolean;
}

const Button = tw.button<ButtonProps>`${(p) =>
  p.$active ? 'text-gray-50' : 'text-gray-400'} flex rounded-md items-center w-full px-2 py-2`;

interface IDropdown {
  label: string;
}

const Dropdown: FC<IDropdown> = ({ label }) => (
  <div>
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="inline-flex justify-center w-full bg-gray-500/25 align-middle px-4 py-2 text-gray-50 rounded-md hover:bg-gray-600/25">
        {label}
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
            <Menu.Item>{({ active }) => <Button $active={active}>Copy Address</Button>}</Menu.Item>
          </div>
          <div className="px-1 py-1">
            <Menu.Item>{({ active }) => <Button $active={active}>Change Wallet</Button>}</Menu.Item>
          </div>
          <div className="px-1 py-1">
            <Menu.Item>{({ active }) => <Button $active={active}>Open In Etherscan</Button>}</Menu.Item>
          </div>
          <div className="px-1 py-1">
            <Menu.Item>{({ active }) => <Button $active={active}>Disconnect</Button>}</Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  </div>
);

export default Dropdown;
