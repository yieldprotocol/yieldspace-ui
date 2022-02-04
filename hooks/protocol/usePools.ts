import useSWR from 'swr';
import { getPools } from '../../lib/protocol';
import useConnector from '../useConnector';
import useContracts from './useContracts';

const usePools = () => {
  const { provider, chainId, account } = useConnector();
  const contractMap = useContracts(provider, chainId);
  const { data, isValidating, error, mutate } = useSWR('/pools', () => getPools(provider, contractMap, account));
  return { data, loading: (!data && !error) || isValidating, error, mutate };
};

export default usePools;
