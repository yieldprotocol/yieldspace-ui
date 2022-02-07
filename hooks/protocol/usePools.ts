import useSWR from 'swr';
import { getPools } from '../../lib/protocol';
import useConnector from '../useConnector';
import useDefaultProvider, { DEFAULT_CHAIN_ID } from '../useDefaultProvider';
import useContracts from './useContracts';

const usePools = () => {
  const { chainId, account, provider } = useConnector();
  const chainIdToUse = chainId ?? DEFAULT_CHAIN_ID;
  // const provider = useDefaultProvider(chainIdToUse);
  const contractMap = useContracts(provider!, chainIdToUse);
  const { data, error } = useSWR('/pools', () => getPools(provider!, contractMap!, account));
  return { data, loading: !data && !error, error };
};

export default usePools;
