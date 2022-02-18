import useSWR from 'swr';
import { getPools } from '../../lib/protocol';
import useConnector from '../useConnector';
import useDefaultProvider, { DEFAULT_CHAIN_ID } from '../useDefaultProvider';
import useContracts from './useContracts';

const usePools = () => {
  const { chainId, account, provider } = useConnector();
  console.log('🦄 ~ file: usePools.ts ~ line 9 ~ usePools ~ account', account);
  const chainIdToUse = chainId ?? DEFAULT_CHAIN_ID;
  // const provider = useDefaultProvider(chainIdToUse);
  const contractMap = useContracts(provider!, chainIdToUse);
  const { data, error } = useSWR([provider, contractMap, account], getPools);
  return { data, loading: !data && !error, error };
};

export default usePools;
