import tw from 'tailwind-styled-components';
import { IAsset, IPool } from '../../lib/protocol/types';
import AssetLogo from './AssetLogo';
import FyTokenLogo from './FyTokenLogo';

const Container = tw.div`w-fit py-2 px-3 dark:bg-gray-600/50 bg-gray-400/50 rounded-lg`;

interface IItemSelect {
  item: IAsset | IPool | undefined;
  isFyToken?: boolean;
  pool?: IPool;
}

const AssetSelect = ({ item, isFyToken = false, pool }: IItemSelect) => (
  <Container>
    {item ? (
      <div className="flex gap-2 items-center">
        {isFyToken ? <FyTokenLogo pool={pool!} /> : <AssetLogo image={item.symbol} />}
        <div className="text-md font-bold align-middle">{item.symbol}</div>
      </div>
    ) : (
      <div className="whitespace-nowrap">Select Pool</div>
    )}
  </Container>
);

export default AssetSelect;
