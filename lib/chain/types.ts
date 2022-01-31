import { BigNumber, Contract } from 'ethers';
import { FYToken, Pool } from '../../contracts/types';

export interface IContractMap {
  [name: string]: Contract;
}

export interface IPool {
  id: string;
  displayName: string;
  displayNameMobile: string;
  maturity: number;

  fullDate: Date;
  fyTokenContract: FYToken;
  fyTokenAddress: string;
  poolContract: Pool;
  poolAddress: string;
  poolName: string;
  poolVersion: string; // for signing
  poolSymbol: string; // for signing

  decimals: number;
  ts: BigNumber;
  g1: BigNumber;
  g2: BigNumber;

  baseId: string;

  color: string;
  textColor: string;
  startColor: string;
  endColor: string;

  oppositeColor: string;
  oppStartColor: string;
  oppEndColor: string;

  seriesMark: React.ElementType;

  // baked in token fns
  getTimeTillMaturity: () => string;
  isMature: () => boolean;
  getBaseAddress: () => string; // antipattern, but required here because app simulatneoulsy gets assets and series
}
