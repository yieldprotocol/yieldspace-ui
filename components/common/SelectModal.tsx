import { FC, useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { getPools } from '../../lib/protocol';
import { IPoolMap } from '../../lib/protocol/types';
import AssetLogo from './AssetLogo';
import Modal from './Modal';

const Button = tw.button`bg-gray-700 hover:bg-gray-500/25 border-2 border-gray-700 hover:border-secondary-500 text-gray-50`;

type IAssetSelectModal = {
  open: boolean;
  setOpen: (open: boolean) => void;
  action: (asset: string) => void;
};

const PoolSelectModal: FC<IAssetSelectModal> = ({ open, setOpen, action }) => {
  const [pools, setPools] = useState<IPoolMap>();

  return (
    <Modal isOpen={open} setIsOpen={setOpen}>
      {Object(pools)
        .values()
        .map((pool) => (
          <Button
            className="flex my-2 p-4 bg-gray-700 rounded-md gap-3 align-middle w-full items-center"
            onClick={() => {
              action(pool);
              setOpen(false);
            }}
            key={pool.address}
          >
            {pool.name}
          </Button>
        ))}
    </Modal>
  );
};

export default AssetSelectModal;
