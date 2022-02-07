import { useMemo } from 'react';
import { CAULDRON, LADLE } from '../../constants';
import { getContracts } from '../../lib/protocol';
import { Provider } from '../../lib/protocol/types';

export const CONTRACTS_TO_FETCH = [LADLE, CAULDRON];

const useContracts = (provider: Provider, chainId: number) =>
  useMemo(() => getContracts(provider, chainId), [provider, chainId]);

export default useContracts;
