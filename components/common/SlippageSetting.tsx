import { Menu, Transition } from '@headlessui/react';
import { CogIcon } from '@heroicons/react/outline';
import { Fragment, useState } from 'react';
import tw from 'tailwind-styled-components';

const Input = tw.input`caret-gray-800 dark:caret-gray-50 text-md appearance-none dark:bg-gray-800 bg-gray-300 dark:focus:text-gray-50 focus:text-gray-800 dark:text-gray-300 text-gray-800 py-1 px-4 leading-tight focus:outline-none `;

const SlippageSetting = ({ slippageTolerance }: { slippageTolerance: string }) => {
  const [setting, setSetting] = useState<string>((+slippageTolerance * 100).toString()); // settings comes in as .005 for .5%

  return (
    <Menu as="div" className="relative">
      <Menu.Button as="div" className="items-center cursor-pointer">
        <CogIcon className="w-5 h-5 dark:text-gray-200 text-gray-800" aria-hidden="true" />
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
        <Menu.Items className="absolute w-40 right-0 origin-top-right rounded-lg shadow-lg z-50 dark:bg-gray-800 bg-gray-300 p-1">
          <div className="p-1">
            <Menu.Item as="div" className="p-1">
              <div className="text-gray-400 text-sm">Slippage Tolerance</div>
              <Input
                name="setting"
                type="number"
                inputMode="decimal"
                value={setting}
                placeholder={setting}
                onChange={(e) => setSetting(e.target.value)}
                min="0"
              />
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default SlippageSetting;
