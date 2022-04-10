import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { CAULDRON, LADLE, WRAP_ETH_MODULE } from '../../constants';
import { getContracts } from '../../lib/protocol';

export const CONTRACTS_TO_FETCH = [CAULDRON, LADLE, WRAP_ETH_MODULE];

const useContracts = () => {
  const { provider, chainId } = useWeb3React();
  return useMemo(() => getContracts(provider!, chainId!), [provider, chainId]);
};

export default useContracts;
