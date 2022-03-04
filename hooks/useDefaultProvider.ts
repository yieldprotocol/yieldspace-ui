import { ethers } from 'ethers';
import { useMemo } from 'react';
import { URLS } from '../config/chains';
import useConnector from './useConnector';

const useDefaultProvider = () => {
  const { chainId } = useConnector();

  return useMemo(
    () => (chainId ? new ethers.providers.JsonRpcProvider(URLS[chainId][0], chainId) : undefined),
    [chainId]
  );
};
export default useDefaultProvider;
