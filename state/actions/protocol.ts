import { IPoolMap } from '../../lib/protocol/types';
import { ActionType } from '../actionTypes/protocol';
import { IProtocolAction } from '../types/protocol';

export const updatePools = (pools: IPoolMap): IProtocolAction => ({
  type: ActionType.POOLS,
  payload: pools,
});
