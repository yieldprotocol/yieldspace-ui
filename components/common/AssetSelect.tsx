import { FC } from 'react';
import tw from 'tailwind-styled-components';
import { IAsset, IPool } from '../../lib/protocol/types';
import AssetLogo from './AssetLogo';

const Container = tw.div`p-2 dark:bg-gray-600 bg-gray-400 rounded-lg`;

interface IItemSelect {
  item: IAsset | IPool | undefined;
  isFyToken: boolean;
}

const AssetSelect: FC<IItemSelect> = ({ item, isFyToken = false }) => (
  <Container>
    {item ? (
      <div className="flex gap-2 items-center">
        <AssetLogo image={item.symbol} isFyToken={isFyToken} />
        <div className="text-md font-bold align-middle">{item.symbol}</div>
      </div>
    ) : (
      <div className="whitespace-nowrap">Select Pool</div>
    )}
  </Container>
);

export default AssetSelect;
