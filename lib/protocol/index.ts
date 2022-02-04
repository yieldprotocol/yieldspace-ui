import { format } from 'date-fns';
import { BigNumber, ethers } from 'ethers';
import { LADLE } from '../../constants';
import { Pool__factory } from '../../contracts/types';
import { IAsset, IContractMap, IPoolMap } from './types';
import { formatFyTokenSymbol, getSeason, SeasonType } from '../../utils/appUtils';
import yieldEnv from '../../config/yieldEnv';
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { CONTRACTS_TO_FETCH } from '../../hooks/protocol/useContracts';
import * as contractTypes from '../../contracts/types';
import { ERC20Permit__factory } from '../../contracts/types/factories/ERC20Permit__factory';

const { seasonColors } = yieldEnv;

/**
 * Gets all pool data
 *
 * @param provider
 * @param contractMap the contracts to use for events
 * @param account user's account address if there is a connected account
 * @param blockNum
 * @returns  {IPoolMap}
 */
export const getPools = async (
  provider: Web3Provider | JsonRpcProvider,
  contractMap: IContractMap,
  account: string | null = null,
  blockNum: number | null = null
): Promise<IPoolMap> => {
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

    const base = await getAsset(provider, baseAddress, account);
    const fyToken = await getAsset(provider, fyTokenAddress, account);

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
      base,
      fyToken,
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

export const getContracts = (
  provider: ethers.providers.JsonRpcProvider | Web3Provider,
  chainId: number
): IContractMap | undefined => {
  if (!chainId || !provider) return;

  const { addresses } = yieldEnv;
  const chainAddrs = addresses[chainId];

  return Object.keys(chainAddrs).reduce((contracts: IContractMap, name: string) => {
    if (CONTRACTS_TO_FETCH.includes(name)) {
      try {
        const contract = contractTypes[`${name}__factory`].connect(chainAddrs[name], provider);
        return { ...contracts, [name]: contract || null };
      } catch (e) {
        console.log(`could not connect directly to contract ${name}`);
        return contracts;
      }
    }
    return undefined;
  }, {});
};

/**
 * Gets token/asset data and balances if there is an account provided
 * @param tokenAddress
 * @param account can be null if there is no account
 * @returns
 */
export const getAsset = async (
  provider: Web3Provider,
  tokenAddress: string,
  account: string | null = null
): Promise<IAsset> => {
  const ERC20 = ERC20Permit__factory.connect(tokenAddress, provider);

  const [symbol, decimals] = await Promise.all([ERC20.symbol(), ERC20.decimals()]);

  const [balance, balance_] = account
    ? await getBalance(provider, account, tokenAddress)
    : [ethers.constants.Zero, '0'];

  return {
    address: tokenAddress,
    symbol: symbol.includes('FY') ? formatFyTokenSymbol(symbol) : symbol,
    decimals,
    balance,
    balance_,
  };
};

/**
 * returns the user's token balance in BigNumber and formatted representations
 * @param tokenAddress
 * @returns {[BigNumber, string]}
 */
export const getBalance = async (
  provider: Web3Provider,
  tokenAddress: string,
  account: string
): Promise<[BigNumber, string]> => {
  const ERC20 = ERC20Permit__factory.connect(tokenAddress, provider);
  const balance = await ERC20.balanceOf(account);
  const balance_ = ethers.utils.formatEther(balance);
  return [balance, balance_];
};
