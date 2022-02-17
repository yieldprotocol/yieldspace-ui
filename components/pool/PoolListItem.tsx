import Link from 'next/link';
import { FC } from 'react';
import tw from 'tailwind-styled-components';
import { IPool } from '../../lib/protocol/types';

const Container = tw.button`w-full my-1.5 dark:hover:bg-gray-700/50 hover:bg-gray-400/50 dark:bg-gray-800/80 bg-gray-300 rounded-md shadow-md`;
const Inner = tw.div`align-middle text-left p-5`;

interface IPoolListItem {
  pool: IPool;
}

const PoolListItem: FC<IPoolListItem> = ({ pool }) => (
  <Link href={`/pool/${pool.address}`} passHref>
    <Container>
      <Inner>
        <div className="font-bold">{pool.name}</div>
        <div className="flex gap-5 mt-3">
          <div className="text-sm">LP Token Balance: {pool.lpTokenBalance_}</div>
        </div>
      </Inner>
    </Container>
  </Link>
);

export default PoolListItem;
