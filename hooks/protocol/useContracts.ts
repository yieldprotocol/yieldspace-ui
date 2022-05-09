import { useMemo } from 'react';
import { useNetwork, useProvider } from 'wagmi';
import { CAULDRON, LADLE, WRAP_ETH_MODULE } from '../../constants';
import { getContracts } from '../../lib/protocol';

export const CONTRACTS_TO_FETCH = [CAULDRON, LADLE, WRAP_ETH_MODULE];

const useContracts = () => {
  const provider = useProvider();
  const { activeChain } = useNetwork();
  return useMemo(() => getContracts(provider!, activeChain?.id!), [provider, activeChain?.id!]);
};

export default useContracts;
