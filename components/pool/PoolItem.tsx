import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import tw from 'tailwind-styled-components';
import { IPool } from '../../lib/protocol/types';
import Button from '../common/Button';
import { BorderWrap } from '../styles';
import usePools from '../../hooks/protocol/usePools';

const Inner = tw.div`align-middle text-left p-5`;
const ButtonWrap = tw.div`flex justify-between gap-10`;
const PoolData = tw.div`h-20 align-middle text-center mt-5`;

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
        <ButtonWrap>
          <Button action={() => router.push('/pool/add')}>Add Liquidity</Button>
          <Button action={() => router.push('/pool/remove')}>Remove</Button>
        </ButtonWrap>
        <PoolData>lp tokens: {pool.lpTokenBalance_}</PoolData>
      </Inner>
    </BorderWrap>
  );
};

export default PoolItem;
