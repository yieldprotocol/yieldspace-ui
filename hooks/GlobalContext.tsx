import { ethers } from 'ethers';
import React, { createContext, useReducer, useEffect } from 'react';
import { URLS } from '../config/chains';
import useConnector from './useConnector';

interface IState {
  provider: ethers.providers.JsonRpcProvider | undefined;
}

type IStateAction = IProviderAction;

export interface IProviderAction {
  type: StateAction.PROVIDER;
  payload: ethers.providers.JsonRpcProvider;
}

enum StateAction {
  PROVIDER = 'provider',
}

interface IGlobalContext {
  state: IState;
}

const GlobalContext = createContext<IGlobalContext>({});

const initState: IState = {
  provider: undefined,
};

function globalReducer(state: IState, action: IStateAction) {
  /* Helper: only change the state if different from existing */
  const onlyIfChanged = (_action: IStateAction) =>
    state[action.type] === _action.payload ? state[action.type] : _action.payload;

  /* Reducer switch */
  switch (action.type) {
    case StateAction.PROVIDER:
      return { ...state, provider: onlyIfChanged(action) };

    default:
      return state;
  }
}

const GlobalProvider = ({ children }: any) => {
  const [state, updateState] = useReducer(globalReducer, initState);
  const { chainId } = useConnector();

  useEffect(() => {
    if (chainId) {
      console.log('setting provider');
      const provider = new ethers.providers.JsonRpcProvider(URLS[chainId!][0]);
      updateState({ type: StateAction.PROVIDER, payload: provider });
    }
  }, [chainId]);

  return <GlobalContext.Provider value={{ state }}>{children}</GlobalContext.Provider>;
};

export { GlobalContext };

export default GlobalProvider;
