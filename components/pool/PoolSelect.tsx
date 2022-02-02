import { FC, useState } from 'react';
import { IPool, IPoolMap } from '../../lib/protocol/types';
import Button from '../common/Button';
import PoolSelectItem from './PoolSelectItem';
import PoolSelectModal from './PoolSelectModal';

interface IPoolSelect {
  pools: IPoolMap;
  pool: IPool | undefined;
  setPool: (pool: IPool) => void;
}

const PoolSelect: FC<IPoolSelect> = ({ pools, pool, setPool }) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  return (
    <>
      {pool ? (
        <PoolSelectItem pool={pool} action={() => setModalOpen(true)} />
      ) : (
        <Button action={() => setModalOpen(true)}>Select Pool</Button>
      )}
      {modalOpen && <PoolSelectModal pools={pools} open={modalOpen} setOpen={setModalOpen} action={setPool} />}
    </>
  );
};

export default PoolSelect;
