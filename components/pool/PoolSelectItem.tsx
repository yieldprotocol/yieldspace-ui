import { FC } from 'react';
import tw from 'tailwind-styled-components';
import { IPool } from '../../lib/protocol/types';
import AssetLogo from '../common/AssetLogo';

const Inner = tw.div`
  h-full w-full dark:bg-gray-900/90 bg-gray-100/90 dark:text-gray-50 text-gray-900 rounded-lg
  flex p-3 gap-3
`;

const Outer = tw.button`w-full flex p-[1px]
rounded-lg gap-3 align-middle items-center hover:opacity-80
`;

interface IPoolSelectItem {
  pool: IPool;
  action: (pool: IPool) => void;
}

const PoolSelectItem: FC<IPoolSelectItem> = ({ pool, action }) => (
  <Outer
    style={{
      background: pool.color,
    }}
    key={pool.address}
    onClick={() => {
      action(pool);
    }}
  >
    <Inner>
      <AssetLogo image={pool.base.symbol} />
      {pool.name}
    </Inner>
  </Outer>
);

export default PoolSelectItem;
