import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, Contract, ethers } from 'ethers';

export type Provider = Web3Provider | ethers.providers.JsonRpcProvider;

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

  getTimeTillMaturity: () => string;
  isMature: () => boolean;
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
}
