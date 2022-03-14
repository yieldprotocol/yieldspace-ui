import { FC, useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { IAsset, IPool, IPoolMap } from '../../lib/protocol/types';
import AssetSelect from '../common/AssetSelect';
import Modal from '../common/Modal';
import { Header } from '../styles';
import TopRow from '../styles/TopRow';
import PoolSelectItem from './PoolSelectItem';

const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;

interface IPoolSelectModal {
  pools: IPoolMap;
  open: boolean;
  setOpen: (open: boolean) => void;
  action: (pool: IPool) => void;
}

const PoolSelectModal: FC<IPoolSelectModal> = ({ pools, open, setOpen, action }) => {
  const [poolList, setPoolList] = useState<IPool[]>(Object.values(pools));
  const [assets, setAssets] = useState<IAsset[] | undefined>();

  const _pools = Object.values(pools);

  const handleFilter = (symbol: string) => {
    setPoolList(_pools.filter((p) => p.base.symbol === symbol));
  };

  useEffect(() => {
    const sorted = Object.values(pools).sort((a, b) => (a.base.symbol < b.base.symbol ? -1 : 1)); // alphabetical underlying base
    // .sort((a, b) => (a.base.balance.gte(b.base.balance) ? 1 : -1)) // sort by base balance
    // .sort((a, b) => (a.isMature ? -1 : 1)); // mature pools at the end
    setPoolList(sorted);
  }, [pools]);

  useEffect(() => {
    const _baseAssets = _pools.reduce(
      (_assets, _pool) => (_assets.has(_pool.base.symbol) ? _assets : _assets.set(_pool.base.symbol, _pool.base)),
      new Map<string, IAsset>()
    );
    setAssets(Array.from(_baseAssets.values()));
  }, [_pools]);

  return (
    <Modal isOpen={open} setIsOpen={setOpen}>
      {assets && (
        <div className="flex flex-wrap gap-4 my-6 justify-center">
          {assets.map((a) => (
            <div
              className="dark:text-gray-50 hover:cursor-pointer"
              key={a.address}
              onClick={() => handleFilter(a.symbol)}
            >
              <AssetSelect item={a} />
            </div>
          ))}
        </div>
      )}
      <Grid>
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
      </Grid>
    </Modal>
  );
};

export default PoolSelectModal;
