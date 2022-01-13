import { ethers } from 'ethers';
import { IChainAction, IChainState } from '../types/chain';
import { ActionType } from '../actionTypes/chain';

const INITIAL_STATE = {
  provider: null as ethers.providers.JsonRpcProvider | null,
  chainId: 1,

  /* flags */
  chainLoading: true,
};

export default function rootReducer(state: IChainState = INITIAL_STATE, action: IChainAction): IChainState {
  switch (action.type) {
    case ActionType.PROVIDER:
      return { ...state, provider: action.payload };
    case ActionType.CHAIN_ID:
      return { ...state, chainId: action.payload };
    case ActionType.CHAIN_LOADING:
    default:
      return state;
  }
}
