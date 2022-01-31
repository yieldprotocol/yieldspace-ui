import { ChevronDownIcon } from '@heroicons/react/solid';
import { FC, useState } from 'react';
import tw from 'tailwind-styled-components';
import AssetLogo from './AssetLogo';
import AssetSelectModal from './AssetSelectModal';
import Button from './Button';

const Selected = tw.button`w-full p-2 bg-gray-700 rounded-md flex gap-2 align-middle`;

type IAssetSelect = {
  asset: string | null;
  setAsset: (asset: string) => void;
};

const AssetSelect: FC<IAssetSelect> = ({ asset, setAsset, children }) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  return (
    <div className="w-full">
      {asset ? (
        <Selected onClick={() => setModalOpen(true)}>
          <AssetLogo image={asset} />
          <span className="text-md font-bold">{asset}</span>
          {/* <ChevronDownIcon className="h-5 w-5" /> */}
        </Selected>
      ) : (
        <Button action={() => setModalOpen(true)}>{children}</Button>
      )}
      {modalOpen && <AssetSelectModal open={modalOpen} setOpen={setModalOpen} action={setAsset} />}
    </div>
  );
};

export default AssetSelect;
