import { ethers } from 'ethers';
import { ActionType } from '../actionTypes/chain';

export interface IChainState {
  provider: ethers.providers.JsonRpcProvider | null;
  chainId: number;
  chainLoading: boolean;
  connection: IConnection;
}

export type IChainAction = IChainProviderAction | IChainChainIdAction | IChainChainLoadingAction;

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

export interface IConnection {
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
  payload: IConnection;
}
