import { FC } from 'react';
import tw from 'tailwind-styled-components';
import { IPool, IPoolMap } from '../../lib/protocol/types';
import AssetLogo from '../common/AssetLogo';
import Modal from '../common/Modal';

const Button = tw.button` border-2 border-gray-700 hover:border-secondary-500 text-gray-900`;

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
        <Button
          className="flex my-2 p-4 rounded-md gap-3 align-middle w-full items-center hover:opacity-80"
          style={{
            background: pool.color,
          }}
          onClick={() => {
            action(pool);
            setOpen(false);
          }}
          key={pool.address}
        >
          <AssetLogo image="usdc" />
          {pool.name}
        </Button>
      ))}
    </Modal>
  );
};

export default PoolSelectModal;
