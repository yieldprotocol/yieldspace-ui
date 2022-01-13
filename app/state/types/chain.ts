import { BigNumber, ethers } from 'ethers';
import { ActionType } from '../actionTypes/chain';

export interface IChainState {
  provider: ethers.providers.JsonRpcProvider | null;
  chainId: number;
  chainLoading: boolean;
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
