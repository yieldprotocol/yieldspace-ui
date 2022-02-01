import Image from 'next/image';
import tw from 'tailwind-styled-components';

interface ILogo {
  image: string;
}

const AssetLogo = ({ image }: ILogo) => <Image src={`/logos/assets/${image}.png`} height={24} width={24} />;

export default AssetLogo;
