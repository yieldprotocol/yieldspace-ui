import Link from 'next/link';
import { FC } from 'react';
import tw from 'tailwind-styled-components';
import { IPool } from '../../lib/protocol/types';
import { Header } from '../styles';

const Container = tw.button`w-full my-1.5 dark:hover:bg-gray-700/50 hover:bg-gray-400/50 dark:bg-gray-800/80 bg-gray-300 rounded-md shadow-md`;
const Inner = tw.div`align-middle text-left p-5`;
const PoolDataWrap = tw.div`my-2 flex items-center gap-3`;
const PoolDataLabel = tw.div`text-gray-400`;
const PoolData = tw.div`font-medium text-gray-100`;

interface IPoolListItem {
  pool: IPool;
}

const PoolListItem: FC<IPoolListItem> = ({ pool }) => (
  <Link href={`/pool/${pool.address}`} passHref>
    <Container>
      <Inner>
        <Header>{pool.name}</Header>
        <PoolDataWrap>
          <PoolDataLabel>LP Token Balance:</PoolDataLabel>
          <PoolData>{pool.lpTokenBalance_}</PoolData>
        </PoolDataWrap>
      </Inner>
    </Container>
  </Link>
);

export default PoolListItem;
