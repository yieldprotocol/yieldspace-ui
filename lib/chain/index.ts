import { ethers } from 'ethers';
import { CAULDRON, LADLE } from '../../constants';
import { FYToken__factory, Pool__factory } from '../../contracts/types';
import { IContractMap, IPool } from './types';

export const getPools = async (
  provider: ethers.providers.JsonRpcProvider,
  contractMap: IContractMap,
  blockNum: number | null
) => {
  const Cauldron = contractMap[CAULDRON];
  const Ladle = contractMap[LADLE];

  const poolAddedEvents = await Ladle.queryFilter('PoolAdded' as ethers.EventFilter, blockNum);

  /* build a map from the poolAdded event data */
  const poolMap: Map<string, string> = new Map(
    poolAddedEvents.map((log) => Ladle.interface.parseLog(log).args) as [[string, string]]
  );
  console.log('🦄 ~ file: index.ts ~ line 20 ~ poolMap', poolMap);

  const newSeriesList: IPool[] = [];

  /* Add in any extra static series */
  try {
    await Promise.all([
      ...poolAddedEvents.map(async (x): Promise<void> => {
        const { seriesId: id, baseId, fyToken } = Cauldron.interface.parseLog(x).args;
        const { maturity }: { maturity: number } = await Cauldron.series(id);

        if (poolMap.has(id)) {
          // only add series if it has a pool
          const poolAddress: string = poolMap.get(id) as string;
          const poolContract = Pool__factory.connect(poolAddress, provider);
          const fyTokenContract = FYToken__factory.connect(fyToken, provider);
          const [name, symbol, version, decimals, poolName, poolVersion, poolSymbol, ts, g1, g2] = await Promise.all([
            fyTokenContract.name(),
            fyTokenContract.symbol(),
            fyTokenContract.version(),
            fyTokenContract.decimals(),
            poolContract.name(),
            poolContract.version(),
            poolContract.symbol(),
            poolContract.ts(),
            poolContract.g1(),
            poolContract.g2(),
          ]);

          const newSeries = {
            id,
            baseId,
            maturity,
            name,
            symbol,
            version,
            address: fyToken,
            fyTokenAddress: fyToken,
            decimals,
            poolAddress,
            poolVersion,
            poolName,
            poolSymbol,
            ts,
            g1,
            g2,
          };
          newSeriesList.push(newSeries);
        }
      }),
    ]);
    return newSeriesList;
  } catch (e) {
    console.log('Error fetching series data: ', e);
    return undefined;
  }
  console.log('Yield Protocol Series data updated.');
};
