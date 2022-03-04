import { useMemo } from 'react';
import { CAULDRON, LADLE } from '../../constants';
import { getContracts } from '../../lib/protocol';
import useConnector from '../useConnector';

export const CONTRACTS_TO_FETCH = [LADLE, CAULDRON];

const useContracts = () => {
  const { provider, chainId } = useConnector();
  return useMemo(() => getContracts(provider!, chainId!), [provider, chainId]);
};

export default useContracts;
