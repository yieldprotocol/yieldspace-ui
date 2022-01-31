import { FC } from 'react';
import tw from 'tailwind-styled-components';
import PoolItem from '../PoolItem';

const Container = tw.div`p-2`;

interface IPools {}

const Pools: FC<IPools> = () => {
  return (
    <Container>
      <PoolItem />
      <PoolItem />
      <PoolItem />
    </Container>
  );
};

export default Pools;
