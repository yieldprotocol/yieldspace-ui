import { FC } from 'react';
import tw from 'tailwind-styled-components';
import useConnector from '../../hooks/useConnector';
import PoolItem from './PoolListItem';

const Container = tw.div`p-2`;

interface IPools {}

const Pools: FC<IPools> = () => {
  const { account } = useConnector();

  if (!account) return <Container>Please connect to your wallet</Container>;
  return (
    <Container>
      <PoolItem />
      <PoolItem />
      <PoolItem />
    </Container>
  );
};

export default Pools;
