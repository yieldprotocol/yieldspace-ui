import { FC } from 'react';
import AssetLogo from './AssetLogo';

interface IStackedAssetLogos {
  image1: string;
  image2: string;
  image1IsFyToken?: boolean;
  image2IsFyToken?: boolean;
}

const StackedAssetLogos: FC<IStackedAssetLogos> = ({ image1, image2, image1IsFyToken, image2IsFyToken }) => (
  <>
    <div className="z-0 relative items-center flex">
      <AssetLogo image={image1} />
    </div>
    <div className="z-20 -ml-5 items-center flex">
      <AssetLogo image={image2} />
    </div>
  </>
);

export default StackedAssetLogos;
