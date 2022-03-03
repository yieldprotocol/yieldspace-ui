import { useMemo } from 'react';
import { CAULDRON, LADLE } from '../../constants';
import { getContracts } from '../../lib/protocol';
import useDefaultProvider from '../useDefaultProvider';

export const CONTRACTS_TO_FETCH = [LADLE, CAULDRON];

const useContracts = (chainId: number) => {
  const provider = useDefaultProvider(chainId);
  return useMemo(() => {
    console.log('fetching contracts');
    return getContracts(provider!, chainId);
  }, [provider, chainId]);
};

export default useContracts;
