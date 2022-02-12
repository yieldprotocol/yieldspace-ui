import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, Contract, ethers } from 'ethers';
import { Pool, Pool__factory } from '../../contracts/types';

export type Provider = Web3Provider | ethers.providers.InfuraProvider;

export interface IContractMap {
  [name: string]: Contract | null;
}

export interface IPoolMap {
  [address: string]: IPool;
}

export interface IPool {
  address: string;
  name: string;
  symbol: string;
  version: string;
  decimals: number;
  maturity: number;
  ts: BigNumber;
  g1: BigNumber;
  g2: BigNumber;

  base: IAsset;
  fyToken: IAsset;

  displayName: string;
  season: string;
  startColor: string;
  endColor: string;
  color: string;
  textColor: string;
  oppStartColor: string;
  oppEndColor: string;
  oppTextColor: string;
  isMature: boolean;

  getTimeTillMaturity: () => string;

  lpTokenBalance: BigNumber;
  lpTokenBalance_: string;

  baseReserves: BigNumber;
  baseReserves_: string;
  fyTokenReserves: BigNumber;
  fyTokenReserves_: string;
  totalSupply: BigNumber;

  contract: Pool;
}

export interface IAssetConfig {
  digitFormat: number;
}

export interface IAsset {
  address: string;
  symbol: string;
  decimals: number;
  balance: BigNumber;
  balance_: string;
  getAllowance: (account: string, spender: string) => Promise<BigNumber>;
}
