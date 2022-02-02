import { IProtocolAction, IProtocolState } from '../types/protocol';
import { ActionType } from '../actionTypes/protocol';

const INITIAL_STATE = {
  pools: null,
};

export default function rootReducer(state: IProtocolState = INITIAL_STATE, action: IProtocolAction): IProtocolState {
  switch (action.type) {
    case ActionType.POOLS:
      return { ...state, pools: action.payload };
    default:
      return state;
  }
}
