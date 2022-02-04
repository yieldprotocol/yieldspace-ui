import { FC } from 'react';
import tw from 'tailwind-styled-components';
import { IPool } from '../../lib/protocol/types';
import AssetLogo from '../common/AssetLogo';

const Button = tw.button` border-2 border-gray-700 hover:border-secondary-500 text-gray-900`;

interface IPoolSelectItem {
  pool: IPool;
  action: (pool: IPool) => void;
}

const PoolSelectItem: FC<IPoolSelectItem> = ({ pool, action }) => (
  <Button
    className="flex my-2 p-4 rounded-md gap-3 align-middle w-full items-center hover:opacity-80"
    style={{
      background: pool.color,
    }}
    onClick={() => {
      action(pool);
    }}
    key={pool.address}
  >
    <AssetLogo image={pool.base.symbol} />
    {pool.name}
  </Button>
);

export default PoolSelectItem;
