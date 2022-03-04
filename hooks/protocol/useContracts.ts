import { useContext, useMemo } from 'react';
import { CAULDRON, LADLE } from '../../constants';
import { getContracts } from '../../lib/protocol';
import { GlobalContext } from '../GlobalContext';

export const CONTRACTS_TO_FETCH = [LADLE, CAULDRON];

const useContracts = (chainId: number) => {
  const {
    state: { provider },
  } = useContext(GlobalContext);

  return useMemo(() => {
    console.log('fetching contracts');
    return getContracts(provider!, chainId);
  }, [provider, chainId]);
};

export default useContracts;
