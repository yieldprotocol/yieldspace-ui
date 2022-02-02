import { FC } from 'react';
import { Switch } from '@headlessui/react';

interface IToggle {
  enabled: boolean;
  setEnabled: (boolean) => void;
  label: string;
}

const Toggle: FC<IToggle> = ({ enabled, setEnabled, label }) => {
  return (
    <Switch.Group>
      <div className="flex gap-2 items-center">
        <Switch
          checked={enabled}
          onChange={setEnabled}
          className={`${
            enabled ? 'bg-primary-600' : 'bg-gray-700'
          } relative inline-flex items-center h-6 rounded-full w-11`}
        >
          <span
            className={`${
              enabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block w-4 h-4 transform bg-primary-400 rounded-full ease-in-out duration-200`}
          />
        </Switch>
        <Switch.Label className="text-sm hover:cursor-pointer">{label}</Switch.Label>
      </div>
    </Switch.Group>
  );
};

export default Toggle;
