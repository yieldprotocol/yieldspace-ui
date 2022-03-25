import { ethers } from 'ethers';
import { IAssetConfig } from '../lib/protocol/types';

// base id's
export const WETH = '0x303000000000';
export const DAI = '0x303100000000';
export const USDC = '0x303200000000';

export const ETH_BASED_ASSETS = ['WETH', 'ETH', WETH, ethers.utils.formatBytes32String('ETH').slice(0, 14)];
export const DAI_PERMIT_ASSETS = ['DAI', DAI];
export const NON_PERMIT_ASSETS = ['ETH', 'WETH', WETH];

export const IGNORE_BASE_ASSETS = ['ETH', 'WETH', WETH];

export const ASSET_INFO = new Map<string, IAssetConfig>();
ASSET_INFO.set('DAI', { digitFormat: 4 });
ASSET_INFO.set('USDC', { digitFormat: 4 });
ASSET_INFO.set('WETH', {
  digitFormat: 4,
});
