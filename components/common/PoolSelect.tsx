import { ChevronDownIcon } from '@heroicons/react/solid';
import { FC, useState } from 'react';
import tw from 'tailwind-styled-components';
import AssetLogo from './AssetLogo';
import AssetSelectModal from './AssetSelectModal';
import Button from './Button';

const Selected = tw.button`h-full w-full p-2 bg-gray-600 rounded-md flex gap-2 justify-between items-center`;

type IAssetSelect = {
  asset: string | null;
  hasCaret?: boolean;
  setAsset: (asset: string) => void;
};

const AssetSelect: FC<IAssetSelect> = ({ asset, setAsset, hasCaret }) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  return (
    <>
      {asset ? (
        <Selected onClick={() => setModalOpen(true)}>
          <div className="flex gap-3">
            <AssetLogo image={asset} />
            <span className="text-md font-bold align-middle">{asset}</span>
          </div>
        </Selected>
      ) : (
        <Button action={() => setModalOpen(true)}>Select Asset</Button>
      )}
      {modalOpen && <AssetSelectModal open={modalOpen} setOpen={setModalOpen} action={setAsset} />}
    </>
  );
};

export default AssetSelect;
