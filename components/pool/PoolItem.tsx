import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import tw from 'tailwind-styled-components';
import { IPool } from '../../lib/protocol/types';
import Button from '../common/Button';
import { BorderWrap, Header } from '../styles';
import usePools from '../../hooks/protocol/usePools';
import BackButton from '../common/BackButton';

const Inner = tw.div`m-4 text-center`;
const ButtonWrap = tw.div`flex justify-between gap-10`;
const PoolDataWrap = tw.div`my-5 flex gap-5 flex-nowrap`;
const PoolDataLabel = tw.div`text-lg text-gray-400`;
const PoolData = tw.div`text-xl font-semibold text-gray-100`;

interface IPoolItem {
  pool: IPool;
}

const PoolItem: FC<IPoolItem> = () => {
  const router = useRouter();
  const { data: pools } = usePools();
  const { address } = router.query;

  const [pool, setPool] = useState<IPool | undefined>();

  useEffect(() => {
    if (pools) {
      const _pool = pools[address as string];
      _pool && setPool(_pool);
    }
  }, [pools, address]);

  if (!pool) return null;

  return (
    <BorderWrap>
      <Inner>
        <BackButton onClick={() => router.back()} />
        <Header>{pool.name}</Header>
        <PoolDataWrap>
          <PoolDataLabel>LP Token Balance:</PoolDataLabel>
          <PoolData>{pool.lpTokenBalance_}</PoolData>
        </PoolDataWrap>
        <PoolDataWrap>
          <PoolDataLabel>LP Token Value:</PoolDataLabel>
          <PoolData>$base value</PoolData>
        </PoolDataWrap>
        <ButtonWrap>
          <Button action={() => router.push(`/pool/add/${address}`)}>Add Liquidity</Button>
          <Button action={() => router.push(`/pool/remove/${address}`)}>Remove</Button>
        </ButtonWrap>
      </Inner>
    </BorderWrap>
  );
};

export default PoolItem;
