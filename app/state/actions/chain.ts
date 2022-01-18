import { ActionType } from 'state/actionTypes/chain';
import { IChainConnectionAction, IConnection } from 'state/types/chain';

export const updateConnection = (connection: IConnection): IChainConnectionAction => ({
  type: ActionType.CONNECTION,
  payload: connection,
});
