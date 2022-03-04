import { InformationCircleIcon } from '@heroicons/react/solid';
import { useState } from 'react';
import { useColorTheme } from '../../hooks/useColorTheme';
import Popover from './PopOver';

interface IInfoIcon {
  height?: string;
  width?: string;
  infoText: string;
}

const InfoIcon = ({ height, width, infoText }: IInfoIcon) => {
  const { theme } = useColorTheme();
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <InformationCircleIcon
        className="hover:cursor-help"
        height={height || '1rem'}
        width={width || '1rem'}
        color={theme === 'dark' ? '#d1d5db' : '#18181b'}
      />
      <Popover open={isHovered}>
        <div className="flex p-2 dark:bg-gray-700 rounded-lg">
          <div className="dark:text-gray-300 text-xs">{infoText}</div>
        </div>
      </Popover>
    </div>
  );
};

export default InfoIcon;
