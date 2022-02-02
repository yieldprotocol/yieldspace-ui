import { ethers } from 'ethers';
import { IPoolMap } from '../../lib/protocol/types';
import { ActionType } from '../actionTypes/protocol';

export interface IProtocolState {
  pools: IPoolMap;
}

export type IProtocolAction = IPoolAction;
