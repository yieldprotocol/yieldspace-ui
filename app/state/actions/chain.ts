import { ActionType } from 'state/actionTypes/chain';
import { IChainConnection, IChainConnectionAction, IChainResetConnectionAction } from 'state/types/chain';

export const updateConnection = (connection: IChainConnection): IChainConnectionAction => ({
  type: ActionType.CONNECTION,
  payload: connection,
});

export const resetConnection = (): IChainResetConnectionAction => ({
  type: ActionType.RESET_CONNECTION,
});
