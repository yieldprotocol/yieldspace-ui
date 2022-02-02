import { FC } from 'react';
import { IPool, IPoolMap } from '../../lib/protocol/types';
import Modal from '../common/Modal';
import PoolSelectItem from './PoolSelectItem';

interface IPoolSelectModal {
  pools: IPoolMap;
  open: boolean;
  setOpen: (open: boolean) => void;
  action: (pool: IPool) => void;
}

const PoolSelectModal: FC<IPoolSelectModal> = ({ pools, open, setOpen, action }) => (
  <Modal isOpen={open} setIsOpen={setOpen}>
    {Object.values(pools).map((pool) => (
      <PoolSelectItem
        key={pool.address}
        pool={pool}
        action={() => {
          action(pool);
          setOpen(false);
        }}
      />
    ))}
  </Modal>
);

export default PoolSelectModal;
