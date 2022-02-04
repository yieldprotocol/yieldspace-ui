import { Network } from '@ethersproject/providers';
import type { Web3ReactHooks } from '@web3-react/core';
import type { MetaMask } from '@web3-react/metamask';
import { hooks as metaMaskHooks, metaMask } from './metaMask';

export const connectors: [MetaMask | Network, Web3ReactHooks][] = [[metaMask, metaMaskHooks]];
