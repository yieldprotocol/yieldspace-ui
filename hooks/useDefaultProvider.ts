import { ethers } from 'ethers';
import { useMemo } from 'react';
import { URLS } from '../config/chains';

const useDefaultProvider = (chainId: number) => {
  console.log('in use default provider hook');

  return useMemo(() => {
    console.log('fetching provider');
    return new ethers.providers.JsonRpcProvider(URLS[chainId][0]);
  }, [chainId]);
};

export default useDefaultProvider;
