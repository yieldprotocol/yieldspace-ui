import { FC, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import tw from 'tailwind-styled-components';
import usePools from '../../hooks/protocol/usePools';
import useConnector from '../../hooks/useConnector';
import { IPool } from '../../lib/protocol/types';
import PoolListItem from './PoolListItem';

const Container = tw.div`p-2`;

interface IPools {}

const Pools: FC<IPools> = () => {
  const { account } = useConnector();
  const { data: pools } = usePools();
  const [poolsList, setPoolsList] = useState<IPool[]>([]);

  useEffect(() => {
    if (pools) {
      const filteredPools = Object.values(pools).filter((p) => p.lpTokenBalance.gt(ethers.constants.Zero));
      const sortedPools = filteredPools.sort((a, b) => (a.lpTokenBalance.gte(b.lpTokenBalance) ? 1 : -1));
      setPoolsList(sortedPools);
    }
  }, [pools]);

  if (!account) return <Container>Please connect to your wallet</Container>;

  return (
    <Container>
      {!poolsList?.length && <div>Your pool positions will show here.</div>}
      {poolsList.map((p) => (
        <PoolListItem pool={p} key={p.address} />
      ))}
    </Container>
  );
};

export default Pools;
