import useSWR from 'swr';
import { getPools } from '../../lib/protocol';
import useConnector from '../useConnector';
import useContracts from './useContracts';

const usePools = () => {
  const { provider, chainId } = useConnector();
  const contractMap = useContracts(provider, chainId);
  const { data, isValidating, error } = useSWR('/pools', () => getPools(provider, contractMap));
  return { data, isValidating, error };
};

export default usePools;
