import { CAULDRON, LADLE } from '../../constants';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { getContracts } from '../../lib/protocol';
import { IContractMap } from '../../lib/protocol/types';

export const CONTRACTS_TO_FETCH = [LADLE, CAULDRON];

const useContracts = (
  provider: ethers.providers.JsonRpcProvider | Web3Provider,
  chainId: number
): IContractMap | undefined => getContracts(provider, chainId);

export default useContracts;
