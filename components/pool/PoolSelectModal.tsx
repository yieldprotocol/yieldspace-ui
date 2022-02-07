import { FC, useEffect, useState } from 'react';
import { IPool, IPoolMap } from '../../lib/protocol/types';
import Modal from '../common/Modal';
import PoolSelectItem from './PoolSelectItem';

interface IPoolSelectModal {
  pools: IPoolMap;
  open: boolean;
  setOpen: (open: boolean) => void;
  action: (pool: IPool) => void;
}

const PoolSelectModal: FC<IPoolSelectModal> = ({ pools, open, setOpen, action }) => {
  const [poolList, setPoolList] = useState<IPool[]>(Object.values(pools));
  useEffect(() => {
    const sorted = Object.values(pools).sort((a, b) => (a.base.symbol < b.base.symbol ? -1 : 1)); // alphabetical underlying base
    // .sort((a, b) => (a.base.balance.gte(b.base.balance) ? 1 : -1)) // sort by base balance
    // .sort((a, b) => (a.isMature ? -1 : 1)); // mature pools at the end
    setPoolList(sorted);
  }, [pools]);

  return (
    <Modal isOpen={open} setIsOpen={setOpen}>
      {poolList.map((pool) => (
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
};

export default PoolSelectModal;
