import { FC } from 'react';
import tw from 'tailwind-styled-components';
import { IAsset } from '../../lib/protocol/types';
import AssetLogo from './AssetLogo';

const Container = tw.div`h-full w-full p-2 bg-gray-600 rounded-lg`;

interface IAssetSelect {
  asset: IAsset | undefined;
}

const AssetSelect: FC<IAssetSelect> = ({ asset }) => (
  <Container>
    {asset ? (
      <div className="flex gap-2">
        <AssetLogo image={asset.symbol} />
        <span className="text-md font-bold align-middle">{asset.symbol}</span>
      </div>
    ) : (
      'Select Pool'
    )}
  </Container>
);

export default AssetSelect;
