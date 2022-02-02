import { BigNumber, Contract } from 'ethers';
import { FYToken, Pool } from '../../contracts/types';

export interface IContractMap {
  [name: string]: Contract;
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

  baseAddress: string;
  fyTokenAddress: string;

  displayName: string;
  season: string;
  startColor: string;
  endColor: string;
  color: string;
  textColor: string;
  oppStartColor: string;
  oppEndColor: string;
  oppTextColor: string;

  seriesMark: React.ElementType;

  // baked in token fns
  getTimeTillMaturity: () => string;
  isMature: () => boolean;
  getBaseAddress: () => string; // antipattern, but required here because app simulatneoulsy gets assets and series
}

export interface IAssetConfig {
  digitFormat: number;
}
