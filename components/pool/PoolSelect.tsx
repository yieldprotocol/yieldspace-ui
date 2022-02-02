import { ChevronDownIcon } from '@heroicons/react/solid';
import { FC, useState } from 'react';
import tw from 'tailwind-styled-components';
import { IPool, IPoolMap } from '../../lib/protocol/types';
import AssetLogo from '../common/AssetLogo';
import Button from '../common/Button';
import PoolSelectModal from './PoolSelectModal';

const Selected = tw.button`h-full w-full p-2 bg-gray-600 rounded-md flex gap-2 justify-between items-center`;

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
        <Selected onClick={() => setModalOpen(true)}>
          <div className="flex gap-3">
            <span className="text-md font-bold align-middle">{pool.name}</span>
          </div>
        </Selected>
      ) : (
        <Button action={() => setModalOpen(true)}>Select Pool</Button>
      )}
      {modalOpen && <PoolSelectModal pools={pools} open={modalOpen} setOpen={setModalOpen} action={setPool} />}
    </>
  );
};

export default PoolSelect;
