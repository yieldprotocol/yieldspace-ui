import { useContext } from 'react';
import useSWR from 'swr';
import { getPools } from '../../lib/protocol';
import { GlobalContext } from '../GlobalContext';
import useConnector from '../useConnector';
import useContracts from './useContracts';

const usePools = () => {
  const { chainId, account } = useConnector();

  const {
    state: { provider },
  } = useContext(GlobalContext);
  const contractMap = useContracts(chainId!);

  const { data, error } = useSWR([provider, contractMap, chainId, account], getPools);

  return { data, loading: !data && !error, error };
};

export default usePools;
