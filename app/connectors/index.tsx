import type { Web3ReactHooks } from '@web3-react/core';
import type { MetaMask } from '@web3-react/metamask';
import type { Network } from '@web3-react/network';
import type { Web3ReactStore } from '@web3-react/types';
import { hooks as metaMaskHooks, metaMask, store as metaMaskStore } from './metaMask';
import { hooks as networkHooks, network, store as networkStore } from './network';

export const connectors: [MetaMask | Network, Web3ReactHooks, Web3ReactStore][] = [
  [metaMask, metaMaskHooks, metaMaskStore],
  [network, networkHooks, networkStore],
];
