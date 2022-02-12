import { FC } from 'react';
import tw from 'tailwind-styled-components';
import { IPool } from '../../lib/protocol/types';
import AssetLogo from '../common/AssetLogo';

const Button = tw.button`
  h-full w-full dark:border-gray-700 border-gray-300 text-gray-900
  flex p-4 rounded-lg gap-3 align-middle items-center hover:opacity-80
`;

interface IPoolSelectItem {
  pool: IPool;
  action: (pool: IPool) => void;
}

const PoolSelectItem: FC<IPoolSelectItem> = ({ pool, action }) => (
  <Button
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
