import { TransactionReceipt } from '@ethersproject/providers';
import { BigNumberish, ethers } from 'ethers';

export interface ILadleAction {
  action: string; // encoded call from useLadleActions
  ignoreIf?: boolean;
}

export interface ISignable {
  name: string;
  version: string;
  address: string;
  symbol: string;
}

export interface ICallData {
  args: (string | BigNumberish | boolean)[] | undefined;
  operation: string | [number, string[]];

  /* optionals */
  targetContract?: ethers.Contract;
  fnName?: string;
  ignoreIf?: boolean;
  overrides?: ethers.CallOverrides;
}

export interface ISignData {
  target: ISignable;
  spender: string;

  /* optional Extension/advanced use-case options */
  amount?: BigNumberish;
  message?: string; // optional messaging for UI
  domain?: IDomain; // optional Domain if required
  ignoreIf?: boolean; // conditional for ignoring
}

export interface IDomain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

export enum ApprovalType {
  TX = 'TX',
  SIG = 'SIG',
}

export interface ITxProcess {
  id: string;
  sig?: ISig;
  tx?: ITx;
  description?: string;
}

export interface ISig {
  id: string;
  txCode: string;
  sigData: string;
  status: Status;
  error: string;
}

export interface ITx {
  txCode: string;
  txHash: string;
  receipt: TransactionReceipt | undefined;
  status: Status;
  error: string;
}

export enum Status {
  FAILED = 'failed',
  REJECTED = 'rejected',
  SUCCESS = 'success',
  PENDING = 'pending',
  WILL_FAIL = 'will fail',
  COMPLETE = 'complete',
}
