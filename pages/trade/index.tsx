import { format } from 'date-fns';
import { ethers } from 'ethers';
import { InferGetServerSidePropsType } from 'next';
import TradeWidget from '../../components/trade/TradeWidget';
import { URLS } from '../../config/chains';
import yieldEnv from '../../config/yieldEnv';
import * as contractTypes from '../../contracts/types';
import { SeriesAddedEvent } from '../../contracts/types/Cauldron';
import { PoolAddedEvent } from '../../contracts/types/Ladle';
import {
  IInitialAssetData,
  IInitialPoolData,
  IInitialPoolMap,
  IPool,
  IPoolMap,
  IPoolRoot,
} from '../../lib/protocol/types';
import { cleanValue, formatFyTokenSymbol, getSeason, hexToRgb, SeasonType } from '../../utils/appUtils';

const Trade = ({ pools }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
  <TradeWidget pools={JSON.parse(pools) as IInitialPoolMap} />
);

export default Trade;

export async function getServerSideProps(context) {
  const chainId = context.query.chainId || 4;
  const provider = new ethers.providers.JsonRpcProvider(URLS[chainId][0]);
  const { addresses } = yieldEnv;
  const chainAddrs = addresses[chainId];
  const Cauldron = contractTypes.Cauldron__factory.connect(chainAddrs.Cauldron, provider);
  const Ladle = contractTypes.Ladle__factory.connect(chainAddrs.Ladle, provider);

  const poolAddedEvents = await Ladle.queryFilter('PoolAdded' as ethers.EventFilter);
  const poolAddresses: string[] = poolAddedEvents.map((e: PoolAddedEvent) => e.args.pool);
  const seriesAddedEvents = await Cauldron.queryFilter('SeriesAdded' as ethers.EventFilter);
  const fyTokenToSeries: Map<string, string> = seriesAddedEvents.reduce(
    (acc: Map<string, string>, e: SeriesAddedEvent) =>
      acc.has(e.args.fyToken) ? acc : acc.set(e.args.fyToken, e.args.seriesId),
    new Map()
  );

  const getAsset = async (
    tokenAddress: string,
    account: string | null = null,
    isFyToken: boolean = false
  ): Promise<IInitialAssetData> => {
    const ERC20 = contractTypes.ERC20Permit__factory.connect(tokenAddress, provider);
    const FYTOKEN = contractTypes.FYToken__factory.connect(tokenAddress, provider);

    const [symbol, decimals, name] = await Promise.all([
      isFyToken ? FYTOKEN.symbol() : ERC20.symbol(),
      isFyToken ? FYTOKEN.decimals() : ERC20.decimals(),
      isFyToken ? FYTOKEN.name() : ERC20.name(),
    ]);

    const symbol_ = symbol === 'WETH' ? 'ETH' : symbol;

    return {
      address: tokenAddress,
      version: symbol === 'USDC' ? '2' : '1',
      name,
      symbol: isFyToken ? formatFyTokenSymbol(symbol) : symbol_,
      decimals,
      balance: ethers.constants.Zero,
      balance_: cleanValue(ethers.utils.formatUnits(ethers.constants.Zero, decimals), decimals),
      digitFormat: 4,
      contract: isFyToken ? FYTOKEN : ERC20,
      getAllowance: async (acc: string, spender: string) =>
        isFyToken ? FYTOKEN.allowance(acc, spender) : ERC20.allowance(acc, spender),
    };
  };
  const formatMaturity = (maturity: number) => format(new Date(maturity * 1000), 'MMMM dd, yyyy');

  const _chargePool = (_pool: IInitialPoolData, _chainId: number) => {
    const { seasonColors } = yieldEnv;
    const season = getSeason(_pool.maturity);
    const oppSeason = (_season: SeasonType) => getSeason(_pool.maturity + 23670000);
    const [startColor, endColor, textColor]: string[] = seasonColors[_chainId][season];
    const [oppStartColor, oppEndColor, oppTextColor]: string[] = seasonColors[_chainId][oppSeason(season)];

    return {
      ..._pool,
      displayName: `${_pool.base.symbol} ${formatMaturity(_pool.maturity)}`,
      maturity_: formatMaturity(_pool.maturity),
      season,
      startColor,
      endColor,
      color: `linear-gradient(${startColor}, ${endColor})`,
      alternateColor: `linear-gradient(270deg, rgba(${hexToRgb(startColor)}, .5) 1.04%, rgba(${hexToRgb(
        endColor
      )}, .5) 98.99%) 0% 0% / 200% 200%`,
      textColor,
      oppStartColor,
      oppEndColor,
      oppTextColor,
    };
  };

  const pools: IPoolMap = await poolAddresses.reduce(async (pools: any, x) => {
    const address = x;
    const poolContract = contractTypes.Pool__factory.connect(address, provider);
    const [
      name,
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
      poolContract.version(),
      poolContract.decimals(),
      poolContract.maturity(),
      poolContract.ts(),
      poolContract.g1(),
      poolContract.g2(),
      poolContract.fyToken(),
      poolContract.base(),
      ethers.constants.Zero,
      poolContract.getBaseBalance(),
      poolContract.getFYTokenBalance(),
      poolContract.totalSupply(),
    ]);

    const base = await getAsset(baseAddress, undefined);
    const fyToken = await getAsset(fyTokenAddress, undefined, true);
    const getTimeTillMaturity = () => maturity - Math.round(new Date().getTime() / 1000);
    const seriesId = fyTokenToSeries.get(fyToken.address);

    const newPool = {
      address,
      name,
      symbol: `FY${base.symbol} ${format(new Date(maturity * 1000), 'MMM yyyy')}`,
      version,
      decimals,
      maturity,
      ts,
      g1,
      g2,
      isMature: maturity < (await provider.getBlock('latest')).timestamp,
      getTimeTillMaturity,
      lpTokenBalance,
      lpTokenBalance_: ethers.utils.formatUnits(lpTokenBalance, decimals),
      baseReserves,
      baseReserves_: ethers.utils.formatUnits(baseReserves, decimals),
      fyTokenReserves,
      fyTokenReserves_: ethers.utils.formatUnits(fyTokenReserves, decimals),
      totalSupply,
      seriesId,
      base,
      fyToken,
      contract: poolContract,
    } as IPoolRoot;
    return { ...(await pools), [address]: _chargePool(newPool, chainId) };
  }, {});

  return { props: { pools: JSON.stringify(pools) } };
}
