import { FC, useState } from 'react';
import { IPool, IPoolMap } from '../../lib/protocol/types';
import Button from '../common/Button';
import PoolSelectItem from './PoolSelectItem';
import PoolSelectModal from './PoolSelectModal';

interface IPoolSelect {
  pools: IPoolMap | undefined;
  pool: IPool | undefined;
  setPool: (pool: IPool) => void;
  poolsLoading?: boolean;
}

const PoolSelect: FC<IPoolSelect> = ({ pools, pool, setPool, poolsLoading }) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  if (!pools) return <>no pools detected</>;
  return (
    <>
      {pool ? (
        <PoolSelectItem pool={pool} action={() => setModalOpen(true)} />
      ) : (
        <Button action={() => setModalOpen(true)} disabled={poolsLoading}>
          {poolsLoading ? 'Pools loading...' : 'Select Pool'}
        </Button>
      )}
      {modalOpen && <PoolSelectModal pools={pools} open={modalOpen} setOpen={setModalOpen} action={setPool} />}
    </>
  );
};

export default PoolSelect;
