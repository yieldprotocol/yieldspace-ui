import { ethers } from 'ethers';
import { ActionType } from '../actionTypes/chain';

export interface IChainState {
  provider: ethers.providers.JsonRpcProvider | null;
  chainId: number;
  chainLoading: boolean;
  connection: IChainConnection;
}

export type IChainAction =
  | IChainProviderAction
  | IChainChainIdAction
  | IChainChainLoadingAction
  | IChainConnectionAction
  | IChainResetConnectionAction;

export interface IChainProviderAction {
  type: ActionType.PROVIDER;
  payload: ethers.providers.JsonRpcProvider;
}

export interface IChainChainIdAction {
  type: ActionType.CHAIN_ID;
  payload: number;
}

export interface IChainChainLoadingAction {
  type: ActionType.CHAIN_LOADING;
  payload: boolean;
}

export interface IChainConnection {
  provider: ethers.providers.Web3Provider | null;
  chainId: number | null;
  fallbackProvider: ethers.providers.JsonRpcProvider | null;
  fallbackChainId: number | null;
  signer?: ethers.providers.JsonRpcSigner | null;
  account: string | null;
  connectionName: string | null;
}

export interface IChainConnectionAction {
  type: ActionType.CONNECTION;
  payload: IChainConnection;
}

export interface IChainResetConnectionAction {
  type: ActionType.RESET_CONNECTION;
}
