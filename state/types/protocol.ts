import { IPoolMap } from '../../lib/protocol/types';

export interface IProtocolState {
  pools: IPoolMap;
}

export type IProtocolAction = any;
