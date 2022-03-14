import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import tw from 'tailwind-styled-components';
import { IPool } from '../../lib/protocol/types';
import Button from '../common/Button';
import { BorderWrap, Header } from '../styles';
import usePools from '../../hooks/protocol/usePools';
import BackButton from '../common/BackButton';
import useRemoveLiqPreview from '../../hooks/protocol/useRemoveLiqPreview';
import { RemoveLiquidityActions } from '../../lib/protocol/liquidity/types';

const Inner = tw.div`m-4 text-center`;
const ButtonWrap = tw.div`flex justify-between gap-10`;
const PoolDataWrap = tw.div`my-5 flex gap-5 flex-nowrap`;
const PoolDataLabel = tw.div`text-lg dark:text-gray-400 text-gray-500`;
const PoolData = tw.div`text-xl font-semibold dark:text-gray-100 text-gray-800`;

const PoolItem: FC = () => {
  const router = useRouter();
  const { data: pools } = usePools();
  const { address } = router.query;

  const [pool, setPool] = useState<IPool | undefined>();
  const lpValue = useRemoveLiqPreview(pool!, pool?.lpTokenBalance_, RemoveLiquidityActions.BURN_FOR_BASE);

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
          <PoolData>${lpValue}</PoolData>
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
