import { FC } from 'react';
import AssetLogo from './AssetLogo';

interface IStackedAssetLogos {
  image1: string;
  image2: string;
  image1IsFyToken?: boolean;
  image2IsFyToken?: boolean;
}

const StackedAssetLogos: FC<IStackedAssetLogos> = ({ image1, image2, image1IsFyToken, image2IsFyToken }) => {
  return (
    <div className="">
      <AssetLogo image={image1} isFyToken={image1IsFyToken} />
      <AssetLogo image={image2} isFyToken={image2IsFyToken} />
    </div>
  );
};

export default StackedAssetLogos;
