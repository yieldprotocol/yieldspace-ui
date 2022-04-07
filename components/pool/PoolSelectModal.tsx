import { FC, useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { IAsset, IPool } from '../../lib/protocol/types';
import AssetSelect from '../common/AssetSelect';
import CloseButton from '../common/CloseButton';
import Modal from '../common/Modal';
import { Header, TopRow } from '../styles/common';
import PoolSelectItem from './PoolSelectItem';

const Grid = tw.div`grid auto-rows-auto gap-2 overflow-auto p-5 max-h-[428px]`;
const Inner = tw.div`dark:bg-gray-900/90 bg-gray-200/70 dark:text-gray-50 text-gray-900 rounded-lg p-3 gap-3`;
const Outer = tw.button`hover:opacity-80 flex p-[1px] rounded-lg gap-3 align-middle items-center`;
const ClearButton = tw.button`text-sm dark:text-gray-50 text-gray-700`;

const MaturityItem = ({ maturity, color, action }: { maturity: string; color: string; action: () => void }) => (
  <Outer
    style={{
      background: color,
    }}
    key={maturity}
    onClick={action}
  >
    <Inner>{maturity}</Inner>
  </Outer>
);

interface IPoolSelectModal {
  pools: IPool[];
  open: boolean;
  setOpen: (open: boolean) => void;
  action: (pool: IPool) => void;
}

interface IMaturitySelect {
  maturity: string;
  color: string;
}

const PoolSelectModal: FC<IPoolSelectModal> = ({ pools, open, setOpen, action }) => {
  const _pools = Object.values(pools);
  const [poolList, setPoolList] = useState<IPool[]>(_pools);
  const [maturities, setMaturities] = useState<IMaturitySelect[]>([]);
  const [assets, setAssets] = useState<IAsset[] | undefined>();
  const [symbolFilter, setSymbolFilter] = useState<string | undefined>();
  const [maturityFilter, setMaturityFilter] = useState<string | undefined>();

  const handleClearFilters = () => {
    if (symbolFilter) {
      setSymbolFilter(undefined);
    }
    if (maturityFilter) {
      setMaturityFilter(undefined);
    }
  };

  useEffect(() => {
    const sorted = _pools
      .sort((a, b) => (a.base.symbol < b.base.symbol ? 1 : -1)) // sort alphabetically by base
      .sort((a, b) => (a.maturity < b.maturity ? 1 : -1)); // closest maturity first
    // .sort((a, b) => (a.base.balance.gte(b.base.balance) ? 1 : -1)) // sort by base balance
    // .sort((a, b) => (a.isMature ? -1 : 1)); // mature pools at the end
    setPoolList(sorted);
  }, [_pools]);

  useEffect(() => {
    const _baseAssets = _pools.reduce(
      (_assets, _pool) => (_assets.has(_pool.base.symbol) ? _assets : _assets.set(_pool.base.symbol, _pool.base)),
      new Map<string, IAsset>()
    );
    setAssets(Array.from(_baseAssets.values()));

    const _maturities = _pools.reduce(
      (_m, _pool) =>
        _m.has(_pool.maturity_)
          ? _m
          : _m.set(_pool.maturity_, { maturity: _pool.maturity_, color: _pool.alternateColor }),
      new Map<string, { maturity: string; color: string }>()
    );
    setMaturities(Array.from(_maturities.values()));
  }, [_pools]);

  useEffect(() => {
    const _handleFilter = () => {
      setPoolList(
        _pools
          .filter((p) => (symbolFilter ? p.base.symbol === symbolFilter : true))
          .filter((p) => (maturityFilter ? p.maturity_ === maturityFilter : true))
      );
    };

    _handleFilter();
  }, [_pools, maturityFilter, symbolFilter]);

  return (
    <Modal isOpen={open} setIsOpen={setOpen}>
      <div className="grid gap-2 p-5">
        <TopRow>
          <Header>Select a pool</Header>
          {(symbolFilter || maturityFilter) && <ClearButton onClick={handleClearFilters}>Clear Filter</ClearButton>}
          <CloseButton action={() => setOpen(false)} height="1.2rem" width="1.2rem" />
        </TopRow>
        {assets && (
          <div className="flex flex-wrap gap-3 my-2 mt-4 justify-start text-sm">
            {assets.map((a) => (
              <div
                className="dark:text-gray-50 hover:cursor-pointer hover:opacity-70"
                key={a.address}
                onClick={() => setSymbolFilter(a.symbol)}
              >
                <AssetSelect item={a} />
              </div>
            ))}
          </div>
        )}
        {maturities && (
          <div className="flex flex-wrap gap-3 justify-start text-sm">
            {maturities.length > 1 &&
              maturities.map((m) => (
                <MaturityItem
                  key={m.maturity}
                  maturity={m.maturity}
                  color={m.color}
                  action={() => setMaturityFilter(m.maturity)}
                />
              ))}
          </div>
        )}
      </div>
      <div className="p-[.25px] dark:bg-gray-700 bg-gray-300"></div>
      <div className="overflow-auto">
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
      </div>
      <div className="p-5"></div>
    </Modal>
  );
};

export default PoolSelectModal;
