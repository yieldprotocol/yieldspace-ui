import { useMemo } from 'react';
import { CAULDRON, LADLE, WRAP_ETH_MODULE } from '../../constants';
import { getContracts } from '../../lib/protocol';
import useConnector from '../useConnector';

export const CONTRACTS_TO_FETCH = [CAULDRON, LADLE, WRAP_ETH_MODULE];

const useContracts = () => {
  const { provider, chainId } = useConnector();
  return useMemo(() => getContracts(provider!, chainId!), [provider, chainId]);
};

export default useContracts;
