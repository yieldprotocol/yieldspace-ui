import { hexToRgb } from '../../utils/appUtils';
import { marks } from '../pool/PoolItem';

interface IAssetLogo {
  image: string;
}

const AssetLogo = ({ image }: IAssetLogo) => {
  const mark = marks[image];
  return (
    <div
      className="h-[24px] w-[24px] rounded-full"
      style={{
        background: `rgba(${hexToRgb(mark.color)}, .12)`,
      }}
    >
      {mark.component}
    </div>
  );
};

export default AssetLogo;
