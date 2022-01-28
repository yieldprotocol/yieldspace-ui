import { ethers } from 'ethers';
import { IChainAction, IChainState } from '../types/chain';
import { ActionType } from '../actionTypes/chain';

const INITIAL_CONNECTION_STATE = {
  provider: null as ethers.providers.Web3Provider | null,
  chainId: null as number | null,
  fallbackProvider: null as ethers.providers.Web3Provider | null,
  fallbackChainId: Number(process.env.NEXT_PUBLIC_DEFAULT_CHAINID) as number | null,
  signer: null as ethers.providers.JsonRpcSigner | null,
  account: null as string | null,
  ensName: null as string | null,
  connectionName: null as string | null,
};

const INITIAL_STATE = {
  provider: null as ethers.providers.JsonRpcProvider | null,
  chainId: 1,
  chainLoading: true,
  connection: INITIAL_CONNECTION_STATE,
};

export default function rootReducer(state: IChainState = INITIAL_STATE, action: IChainAction): IChainState {
  switch (action.type) {
    case ActionType.PROVIDER:
      return { ...state, provider: action.payload };
    case ActionType.CHAIN_ID:
      return { ...state, chainId: action.payload };
    case ActionType.CHAIN_LOADING:
      return { ...state, chainLoading: action.payload };
    case ActionType.CONNECTION:
      return { ...state, connection: { ...state.connection, ...action.payload } };
    case ActionType.RESET_CONNECTION:
      return { ...state, connection: INITIAL_CONNECTION_STATE };
    default:
      return state;
  }
}
