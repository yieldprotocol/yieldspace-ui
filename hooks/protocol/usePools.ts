import { useWeb3React } from '@web3-react/core';
import useSWR from 'swr';
import { getPools } from '../../lib/protocol';
import { IPoolMap } from '../../lib/protocol/types';
import useContracts from './useContracts';

const usePools = () => {
  const { chainId, account, provider } = useWeb3React();
  const contractMap = useContracts();

  const { data, error } = useSWR(
    `/pools/${chainId}/${account}`,
    () => getPools(provider!, contractMap!, chainId!, account!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    data: data as IPoolMap,
    loading: !data && !error,
    error,
  };
};

export default usePools;
