import Image from 'next/image';

interface IAssetLogo {
  image: string;
}

const AssetLogo = ({ image }: IAssetLogo) => (
  <Image src={`/logos/assets/${image}.png`} height={24} width={24} alt={image} />
);

export default AssetLogo;
