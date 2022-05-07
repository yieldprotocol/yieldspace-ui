import useSWR from 'swr';
import { useAccount, useNetwork, useProvider } from 'wagmi';
import { getPools } from '../../lib/protocol';
import { IPoolMap } from '../../lib/protocol/types';
import useContracts from './useContracts';

const usePools = () => {
  const { data: account } = useAccount();
  const { activeChain } = useNetwork();
  const provider = useProvider();
  const contractMap = useContracts();

  const { data, error } = useSWR(
    `/pools/${activeChain?.id!}/${account}`,
    () => getPools(provider!, contractMap!, activeChain?.id!, account?.address!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    data: data as IPoolMap | undefined,
    loading: !data && !error,
    error,
  };
};

export default usePools;
