import useSWR from 'swr';
import { getPools } from '../../lib/protocol';
import { IContractMap } from '../../lib/protocol/types';
import useConnector from '../useConnector';
import useContracts from './useContracts';

const usePools = () => {
  const { provider, chainId } = useConnector();
  const contractMap = useContracts(provider, chainId);
  const { data, isValidating, error } = useSWR('/pools', getPools, fetcherArgs:{ provider, contractMap });
  return data;
};

export default usePools;
