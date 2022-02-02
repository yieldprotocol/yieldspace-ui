import Image from 'next/image';
import { FC } from 'react';

interface IAssetLogo {
  image: string;
  isFyToken?: boolean;
}

const AssetLogo: FC<IAssetLogo> = ({ image, isFyToken }) => (
  <Image
    className={isFyToken ? 'rounded-full ring-2 ring-secondary-400 z-10' : ''}
    src={`/logos/assets/${image}.png`}
    height={24}
    width={24}
  />
);

export default AssetLogo;
