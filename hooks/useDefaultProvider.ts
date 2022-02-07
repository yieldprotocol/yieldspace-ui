import { ethers } from 'ethers';
import { useMemo } from 'react';

export const DEFAULT_CHAIN_ID = Number(process.env.defaultChainId);

const useDefaultProvider = (chainId: number = DEFAULT_CHAIN_ID) =>
  useMemo(() => new ethers.providers.InfuraProvider(chainId, process.env.infuraKey), [chainId]);

export default useDefaultProvider;
