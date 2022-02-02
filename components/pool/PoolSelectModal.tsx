import { FC } from 'react';
import tw from 'tailwind-styled-components';
import { IPool, IPoolMap } from '../../lib/protocol/types';
import AssetLogo from '../common/AssetLogo';
import Modal from '../common/Modal';
import StackedAssetLogos from '../common/StackedAssetLogos';

const Button = tw.button`bg-gray-700 hover:bg-gray-500/25 border-2 border-gray-700 hover:border-secondary-500 text-gray-50`;

interface IPoolSelectModal {
  pools: IPoolMap;
  open: boolean;
  setOpen: (open: boolean) => void;
  action: (pool: IPool) => void;
}

const PoolSelectModal: FC<IPoolSelectModal> = ({ pools, open, setOpen, action }) => (
  <Modal isOpen={open} setIsOpen={setOpen}>
    {Object.values(pools).map((pool) => (
      <Button
        className="flex my-2 p-4 bg-gray-700 rounded-md gap-3 align-middle w-full items-center"
        onClick={() => {
          action(pool);
          setOpen(false);
        }}
        key={pool.address}
      >
        {/* <StackedAssetLogos image1={'eth'} image2={'usdc'} /> */}
        <AssetLogo image="usdc" />
        {pool.name}
      </Button>
    ))}
  </Modal>
);

export default PoolSelectModal;
