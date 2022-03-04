import { format } from 'date-fns';
import { BigNumber, ethers } from 'ethers';
import { LADLE } from '../../constants';
import { Pool__factory } from '../../contracts/types';
import { IAsset, IContractMap, IPoolMap, Provider } from './types';
import { cleanValue, formatFyTokenSymbol, getSeason, SeasonType } from '../../utils/appUtils';
import yieldEnv from '../../config/yieldEnv';
import { CONTRACTS_TO_FETCH } from '../../hooks/protocol/useContracts';
import * as contractTypes from '../../contracts/types';
import { ERC20Permit__factory } from '../../contracts/types/factories/ERC20Permit__factory';
import { FYToken__factory } from '../../contracts/types/factories/FYToken__factory';
import { PoolAddedEvent } from '../../contracts/types/Ladle';

const { seasonColors } = yieldEnv;

/**
 * Gets all pool data
 *
 * @param provider
 * @param contractMap the contracts to use for events
 * @param chainId currently connected chain id or mainnet as default
 * @param account user's account address if there is a connected account
 * @param blockNum
 * @returns  {IPoolMap}
 */
export const getPools = async (
  provider: Provider,
  contractMap: IContractMap,
  chainId: number = 1,
  account: string | undefined = undefined
): Promise<IPoolMap | undefined> => {
  const Ladle = contractMap[LADLE];
  if (!Ladle) return undefined;
  console.log('fetching pools');
  const poolAddedEvents = await Ladle.queryFilter('PoolAdded' as ethers.EventFilter);
  const poolAddresses: string[] = poolAddedEvents.map((e: PoolAddedEvent) => e.args.pool);

  try {
    return poolAddresses.reduce(async (pools: any, x) => {
      const address = x;
      const poolContract = Pool__factory.connect(address, provider);
      const [
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
        lpTokenBalance,
        baseReserves,
        fyTokenReserves,
        totalSupply,
      ] = await Promise.all([
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
        poolContract.balanceOf(account!),
        poolContract.getBaseBalance(),
        poolContract.getFYTokenBalance(),
        poolContract.totalSupply(),
      ]);

      const base = await getAsset(provider, baseAddress, account);
      const fyToken = await getAsset(provider, fyTokenAddress, account, true);
      const getTimeTillMaturity = () => maturity - Math.round(new Date().getTime() / 1000);

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
        isMature: maturity > (await provider.getBlock('latest')).timestamp,
        lpTokenBalance,
        lpTokenBalance_: cleanValue(ethers.utils.formatUnits(lpTokenBalance, decimals), 2),
        baseReserves,
        baseReserves_: cleanValue(ethers.utils.formatUnits(baseReserves, decimals), 2),
        fyTokenReserves,
        fyTokenReserves_: cleanValue(ethers.utils.formatUnits(fyTokenReserves, decimals), 2),
        getTimeTillMaturity,
        contract: poolContract,
        totalSupply,
      };
      return { ...(await pools), [address]: _chargePool(newPool, chainId) };
    }, {});
  } catch (e) {
    console.log('error fetching pools', e);
  }
};

/* add on extra/calculated ASYNC series info and contract instances */
const _chargePool = (_pool: { maturity: number }, _chainId: number) => {
  const season = getSeason(_pool.maturity);
  const oppSeason = (_season: SeasonType) => getSeason(_pool.maturity + 23670000);
  const [startColor, endColor, textColor]: string[] = seasonColors[_chainId][season];
  const [oppStartColor, oppEndColor, oppTextColor]: string[] = seasonColors[_chainId][oppSeason(season)];
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

export const getContracts = (provider: Provider, chainId: number): IContractMap | undefined => {
  if (!chainId || !provider) return undefined;

  const { addresses } = yieldEnv;
  const chainAddrs = addresses[chainId];

  if (!chainAddrs) return undefined;

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
 * @param isFyToken optional
 * @returns
 */
export const getAsset = async (
  provider: Provider,
  tokenAddress: string,
  account: string | null = null,
  isFyToken: boolean = false
): Promise<IAsset> => {
  const ERC20 = ERC20Permit__factory.connect(tokenAddress, provider);
  const FYTOKEN = FYToken__factory.connect(tokenAddress, provider);

  const [symbol, decimals, name] = await Promise.all([ERC20.symbol(), ERC20.decimals(), ERC20.name()]);

  const balance = account ? await getBalance(provider, tokenAddress, account, isFyToken) : ethers.constants.Zero;

  return {
    address: tokenAddress,
    version: symbol === 'USDC' ? '2' : '1',
    name,
    symbol: symbol.includes('FY') ? formatFyTokenSymbol(symbol) : symbol,
    decimals,
    balance,
    balance_: cleanValue(ethers.utils.formatUnits(balance, decimals), 2),
    contract: isFyToken ? FYTOKEN : ERC20,
    getAllowance: async (acc: string, spender: string) => ERC20.allowance(acc, spender),
  };
};

/**
 * returns the user's token (either base or fyToken) balance in BigNumber
 * @param tokenAddress
 * @param isFyToken optional
 * @returns {BigNumber}
 */
export const getBalance = (
  provider: Provider,
  tokenAddress: string,
  account: string,
  isFyToken: boolean = false
): Promise<BigNumber> | BigNumber => {
  const contract = isFyToken
    ? FYToken__factory.connect(tokenAddress, provider)
    : ERC20Permit__factory.connect(tokenAddress, provider);

  try {
    return contract.balanceOf(account);
  } catch (e) {
    console.log('error getting balance for', tokenAddress);
    return ethers.constants.Zero;
  }
};
