import { format } from 'date-fns';
import { ethers } from 'ethers';
import { CAULDRON, LADLE } from '../../constants';
import { FYToken__factory, Pool__factory } from '../../contracts/types';
import { IContractMap, IPool, IPoolMap } from './types';
import { getSeason, SeasonType } from '../../utils/appUtils';
import yieldEnv from '../../config/yieldEnv';
import { Web3Provider } from '@ethersproject/providers';

const { seasonColors } = yieldEnv;

/**
 * Gets all pool data
 *
 * @param provider
 * @param contractMap
 * @param blockNum
 * @returns  {IPoolMap}
 */
export const getPools = async (provider: Web3Provider, contractMap: IContractMap, blockNum: number | null = null) => {
  const Ladle = contractMap[LADLE];
  const poolAddedEvents = await Ladle.queryFilter('PoolAdded' as ethers.EventFilter, blockNum);

  const poolAddresses: string[] = poolAddedEvents.map((log) => Ladle.interface.parseLog(log).args[1]);

  return poolAddresses.reduce(async (pools: any, x) => {
    const address = x;
    const poolContract = Pool__factory.connect(address, provider);
    const [name, symbol, version, decimals, maturity, ts, g1, g2, fyTokenAddress, baseAddress] = await Promise.all([
      poolContract.name(),
      poolContract.symbol(),
      poolContract.version(),
      poolContract.decimals(),
      poolContract.maturity(),
      poolContract.ts(),
      poolContract.g1(),
      poolContract.g2(),
      poolContract.fyToken(),
      poolContract.base(),
    ]);

    const newPool = {
      address,
      name,
      symbol,
      version,
      decimals,
      maturity,
      ts,
      g1,
      g2,
      fyTokenAddress,
      baseAddress,
    };
    return { ...(await pools), [address]: _chargePool(newPool) };
  }, {});
};

/* add on extra/calculated ASYNC series info and contract instances */
const _chargePool = (_pool: { maturity: number }) => {
  const season = getSeason(_pool.maturity) as SeasonType;
  const oppSeason = (_season: SeasonType) => getSeason(_pool.maturity + 23670000) as SeasonType;
  const [startColor, endColor, textColor]: string[] = seasonColors[season];
  const [oppStartColor, oppEndColor, oppTextColor]: string[] = seasonColors[oppSeason(season)];
  return {
    ..._pool,
    displayName: format(new Date(_pool.maturity * 1000), 'dd MMM yyyy'),
    season,
    startColor,
    endColor,
    color: `linear-gradient(${startColor}, ${endColor})`,
    textColor,
    oppStartColor,
    oppEndColor,
    oppTextColor,
  };
};
