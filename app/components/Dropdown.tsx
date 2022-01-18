import { FC, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';

interface IDropdown {
  label: string;
}

const Dropdown: FC<IDropdown> = ({ label }) => (
  <div>
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="w-full gap-2 bg-gray-500/25 align-middle px-4 py-2 text-gray-50 rounded-md hover:bg-gray-600/25">
        {label}
        <ChevronDownIcon className="align-middle w-5 h-5 ml-2 -mr-1 text-gray-50" />
      </Menu.Button>
      <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="px-1 py-1 ">
          <Menu.Item>
            <span>Profile</span>
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  </div>
);

export default Dropdown;
