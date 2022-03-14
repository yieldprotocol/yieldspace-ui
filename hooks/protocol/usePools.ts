import useSWR, { SWRConfiguration } from 'swr';
import { getPools } from '../../lib/protocol';
import useConnector from '../useConnector';
import useContracts from './useContracts';

const usePools = () => {
  const { chainId, account, provider } = useConnector();
  const contractMap = useContracts();

  const options = { revalidateOnFocus: false } as SWRConfiguration;
  const { data, error } = useSWR([provider, contractMap, chainId, account], getPools, options);

  return { data, loading: !data && !error, error };
};

export default usePools;
