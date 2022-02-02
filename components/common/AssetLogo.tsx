import Image from 'next/image';
import { FC } from 'react';

interface IAssetLogo {
  image: string;
  isFyToken?: boolean;
}

const AssetLogo: FC<IAssetLogo> = ({ image, isFyToken }) => (
  <Image
    className={isFyToken ? 'border-2 border-secondary-600' : undefined}
    src={`/logos/assets/${image}.png`}
    height={24}
    width={24}
  />
);

export default AssetLogo;
