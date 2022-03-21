import Link from 'next/link';
import { FC } from 'react';
import tw from 'tailwind-styled-components';
import { IPool } from '../../lib/protocol/types';
import { cleanValue } from '../../utils/appUtils';
import { Header } from '../styles';

const Container = tw.button`w-full my-1.5 dark:hover:bg-gray-700/50 hover:bg-gray-400/50 dark:bg-gray-800/80 bg-gray-300 rounded-md shadow-md`;
const Inner = tw.div`align-middle text-left p-5`;
const PoolDataWrap = tw.div`my-2 flex items-center gap-3`;
const PoolDataLabel = tw.div`dark:text-gray-400 text-gray-500`;
const PoolData = tw.div`font-medium dark:text-gray-100 text-gray-800`;

interface IPoolListItem {
  pool: IPool;
}

const PoolListItem: FC<IPoolListItem> = ({ pool }) => (
  <Link href={`/pool/${pool.address}`} passHref>
    <Container>
      <Inner>
        <Header>{pool.displayName}</Header>
        <PoolDataWrap>
          <PoolDataLabel>LP Token Balance:</PoolDataLabel>
          <PoolData>{cleanValue(pool.lpTokenBalance_, 2)}</PoolData>
        </PoolDataWrap>
      </Inner>
    </Container>
  </Link>
);

export default PoolListItem;
