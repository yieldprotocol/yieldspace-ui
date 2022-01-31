import Image from 'next/image';
import tw from 'tailwind-styled-components';

const ImageWrap = tw.div`my-auto align-middle`;

interface ILogo {
  image: string;
}

const AssetLogo = ({ image }: ILogo) => (
  <ImageWrap>
    <Image src={`/logos/assets/${image}.png`} className="my-auto" height={20} width={20} />
  </ImageWrap>
);

export default AssetLogo;
