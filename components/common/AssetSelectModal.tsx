import { FC } from 'react';
import AssetLogo from './AssetLogo';
import Modal from './Modal';

type IAssetSelectModal = {
  open: boolean;
  setOpen: (open: boolean) => void;
  action: (asset: string) => void;
};

const AssetSelectModal: FC<IAssetSelectModal> = ({ open, setOpen, action }) => {
  return (
    <Modal isOpen={open} setIsOpen={setOpen}>
      {['ETH', 'USDC'].map((asset: string) => (
        <button
          className="flex my-2 p-2 bg-gray-700 rounded-md gap-3 align-middle w-full"
          onClick={() => {
            action(asset);
            setOpen(false);
          }}
          key={asset}
        >
          <AssetLogo image={asset} />
          {asset}
        </button>
      ))}
    </Modal>
  );
};

export default AssetSelectModal;
