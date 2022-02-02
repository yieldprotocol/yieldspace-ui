import { FC } from 'react';
import tw from 'tailwind-styled-components';
import { IPool, IPoolMap } from '../../lib/protocol/types';
import AssetLogo from '../common/AssetLogo';
import Modal from '../common/Modal';
import PoolSelectItem from './PoolSelectItem';

interface IPoolSelectModal {
  pools: IPoolMap;
  open: boolean;
  setOpen: (open: boolean) => void;
  action: (pool: IPool) => void;
}

const PoolSelectModal: FC<IPoolSelectModal> = ({ pools, open, setOpen, action }) => {
  return (
    <Modal isOpen={open} setIsOpen={setOpen}>
      {Object.values(pools).map((pool) => (
        <PoolSelectItem
          key={pool.address}
          pool={pool}
          action={(pool) => {
            action(pool);
            setOpen(false);
          }}
        />
      ))}
    </Modal>
  );
};

export default PoolSelectModal;
