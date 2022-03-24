import useSWR from 'swr';
import { getPools } from '../../lib/protocol';
import { IPoolMap } from '../../lib/protocol/types';
import useConnector from '../useConnector';
import useContracts from './useContracts';

const usePools = () => {
  const { chainId, account, provider } = useConnector();
  const contractMap = useContracts();

  const { data, error } = useSWR(
    `/pools/${chainId}/${account}`,
    () => getPools(provider!, contractMap!, chainId!, account!),
    {
      revalidateOnFocus: false,
    }
  );

  console.log('🦄 ~ file: usePools.ts ~ line 12 ~ usePools ~ data', data);
  return {
    data: data as IPoolMap,
    loading: !data && !error,
    error,
  };
};

export default usePools;
