import { ActionType } from '../actionTypes/chain';
import { IChainConnection, IChainConnectionAction, IChainResetConnectionAction } from '../types/chain';

export const updateConnection = (connection: IChainConnection): IChainConnectionAction => ({
  type: ActionType.CONNECTION,
  payload: connection,
});

export const resetConnection = (): IChainResetConnectionAction => ({
  type: ActionType.RESET_CONNECTION,
});
