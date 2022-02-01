import yieldEnv from '../../config/yieldEnv';
import { CAULDRON, LADLE } from '../../constants';
import * as contractTypes from '../../contracts/types';
import { Contract, ethers } from 'ethers';

interface IContracts {
  [name: string]: Contract | null;
}

const CONTRACTS_TO_FETCH = [LADLE, CAULDRON];

const useContracts = (provider: ethers.providers.JsonRpcProvider, chainId: number) => {
  const { addresses } = yieldEnv;
  const chainAddrs = addresses[chainId];

  return Object.keys(chainAddrs).reduce((contracts: IContracts, name: string) => {
    if (CONTRACTS_TO_FETCH.includes(name)) {
      try {
        const contract = contractTypes[`${name}__factory`].connect(chainAddrs[name], provider);
        contracts[name] = contract || null;
        return contracts;
      } catch (e) {
        console.log(`could not connect directly to contract ${name}`);
        return contracts;
      }
    }
  }, {});
};

export default useContracts;
