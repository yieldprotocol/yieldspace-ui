import { FC } from 'react';
import tw from 'tailwind-styled-components';
import { IAsset, IPool } from '../../lib/protocol/types';
import AssetLogo from './AssetLogo';

const Container = tw.div`h-full w-full p-2 dark:bg-gray-600 bg-gray-400 rounded-lg`;

interface IItemSelect {
  item: IAsset | IPool | undefined;
}

const AssetSelect: FC<IItemSelect> = ({ item }) => (
  <Container>
    {item ? (
      <div className="flex gap-2">
        <AssetLogo image={item.symbol} />
        <span className="text-md font-bold align-middle">{item.symbol}</span>
      </div>
    ) : (
      'Select Pool'
    )}
  </Container>
);

export default AssetSelect;
