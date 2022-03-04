import useSWR from 'swr';
import { getPools } from '../../lib/protocol';
import useConnector from '../useConnector';
import useDefaultProvider from '../useDefaultProvider';
import useContracts from './useContracts';

const usePools = () => {
  const { chainId, account } = useConnector();
  const contractMap = useContracts();
  const provider = useDefaultProvider();

  const { data, error } = useSWR(provider && chainId ? [provider, contractMap, chainId, account] : null, getPools);

  return { data, loading: !data && !error, error };
};

export default usePools;
