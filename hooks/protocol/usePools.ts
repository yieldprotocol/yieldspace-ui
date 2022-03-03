import useSWR from 'swr';
import { getPools } from '../../lib/protocol';
import useConnector from '../useConnector';
import useDefaultProvider from '../useDefaultProvider';
import useContracts from './useContracts';

const usePools = () => {
  const { chainId, account } = useConnector();
  const provider = useDefaultProvider(chainId!);
  const contractMap = useContracts(chainId!);

  const { data, error } = useSWR([provider, contractMap, chainId, account], getPools);
  console.log('🦄 ~ file: usePools.ts ~ line 14 ~ usePools ~ data', data);

  return { data, loading: !data && !error, error };
};

export default usePools;
