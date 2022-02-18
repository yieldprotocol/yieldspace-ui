import Image from 'next/image';
import { FC } from 'react';
import YieldMark from './YieldMark';

interface IAssetLogo {
  image: string;
  isFyToken?: boolean;
}

const AssetLogo: FC<IAssetLogo> = ({ image, isFyToken }) =>
  isFyToken ? (
    <YieldMark
      height={24}
      width={24}
      colors={['#f79533', '#f37055', '#ef4e7b', '#a166ab', '#5073b8', '#1098ad', '#07b39b', '#6fba82']}
    />
  ) : (
    <Image src={`/logos/assets/${image}.png`} height={24} width={24} alt={image} />
  );

export default AssetLogo;
