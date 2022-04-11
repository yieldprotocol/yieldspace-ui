import { JsonRpcProvider } from '@ethersproject/providers';
import { InferGetStaticPropsType } from 'next';
import TradeWidget from '../../components/trade/TradeWidget';
import { URLS } from '../../config/chains';
import { IPoolMap } from '../../lib/protocol/types';
import { getContracts, getPools } from '../../lib/protocol';

const Trade = ({ pools }: InferGetStaticPropsType<typeof getStaticProps>) => (
  <TradeWidget pools={JSON.parse(pools!) as IPoolMap} />
);

export default Trade;

export async function getStaticProps() {
  try {
    const chainId = 4;
    const provider = new JsonRpcProvider(URLS[chainId][0], chainId);
    const contracts = getContracts(provider, chainId);
    const pools = await getPools(provider, contracts!, chainId, undefined);
    return { props: { pools: JSON.stringify(pools) } };
  } catch (error) {
    return { notFound: true, props: { pools: undefined } };
  }
}
