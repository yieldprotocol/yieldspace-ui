import type { AddEthereumChainParameter } from '@web3-react/types';

const ETH: AddEthereumChainParameter['nativeCurrency'] = {
  name: 'Ether',
  symbol: 'ETH',
  decimals: 18,
};

const MATIC: AddEthereumChainParameter['nativeCurrency'] = {
  name: 'Matic',
  symbol: 'MATIC',
  decimals: 18,
};

interface BasicChainInformation {
  urls: (string | undefined)[];
  name: string;
}

export interface ExtendedChainInformation extends BasicChainInformation {
  nativeCurrency: AddEthereumChainParameter['nativeCurrency'];
  blockExplorerUrls: AddEthereumChainParameter['blockExplorerUrls'];
}

function isExtendedChainInformation(
  chainInformation: BasicChainInformation | ExtendedChainInformation
): chainInformation is ExtendedChainInformation {
  return !!(chainInformation as ExtendedChainInformation).nativeCurrency;
}

export function getAddChainParameters(chainId: number): AddEthereumChainParameter | number {
  const chainInformation = CHAINS[chainId];
  if (isExtendedChainInformation(chainInformation)) {
    return {
      chainId,
      chainName: chainInformation.name,
      nativeCurrency: chainInformation.nativeCurrency,
      rpcUrls: chainInformation.urls as string[],
      blockExplorerUrls: chainInformation.blockExplorerUrls,
    };
  } else {
    return chainId;
  }
}

export const CHAINS: { [chainId: number]: BasicChainInformation | ExtendedChainInformation } = {
  1: {
    urls: [
      process.env.infuraKey ? `https://mainnet.infura.io/v3/${process.env.infuraKey}` : undefined,
      process.env.alchemyKey ? `https://eth-mainnet.alchemyapi.io/v2/${process.env.alchemyKey}` : undefined,
      'https://cloudflare-eth.com',
    ],
    name: 'Mainnet',
    blockExplorerUrls: ['https://etherscan.io'],
  },
  3: {
    urls: [process.env.infuraKey ? `https://ropsten.infura.io/v3/${process.env.infuraKey}` : undefined],
    name: 'Ropsten',
    blockExplorerUrls: ['https://ropsten.etherscan.io'],
  },
  4: {
    urls: [process.env.infuraKey ? `https://rinkeby.infura.io/v3/${process.env.infuraKey}` : undefined],
    name: 'Rinkeby',
    blockExplorerUrls: ['https://rinkeby.etherscan.io'],
  },
  5: {
    urls: [process.env.infuraKey ? `https://goerli.infura.io/v3/${process.env.infuraKey}` : undefined],
    name: 'Görli',
    blockExplorerUrls: ['https://goerli.etherscan.io'],
  },
  42: {
    urls: [process.env.infuraKey ? `https://kovan.infura.io/v3/${process.env.infuraKey}` : undefined],
    name: 'Kovan',
    blockExplorerUrls: ['https://kovan.etherscan.io'],
  },
  // Optimism
  10: {
    urls: [
      process.env.infuraKey ? `https://optimism-mainnet.infura.io/v3/${process.env.infuraKey}` : undefined,
      'https://mainnet.optimism.io',
    ],
    name: 'Optimistic Ethereum',
    nativeCurrency: ETH,
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
  },
  69: {
    urls: [
      process.env.infuraKey ? `https://optimism-kovan.infura.io/v3/${process.env.infuraKey}` : undefined,
      'https://kovan.optimism.io',
    ],
    name: 'Optimistic Kovan',
    nativeCurrency: ETH,
    blockExplorerUrls: ['https://kovan-optimistic.etherscan.io'],
  },
  // Arbitrum
  42161: {
    urls: [
      process.env.infuraKey ? `https://arbitrum-mainnet.infura.io/v3/${process.env.infuraKey}` : undefined,
      'https://arb1.arbitrum.io/rpc',
    ],
    name: 'Arbitrum One',
    nativeCurrency: ETH,
    blockExplorerUrls: ['https://arbiscan.io'],
  },
  421611: {
    urls: [
      process.env.alchemyKeyArbitrumRinkeby
        ? `https://arb-rinkeby.g.alchemy.com/v2/${process.env.alchemyKeyArbitrumRinkeby}`
        : undefined,
      'https://rinkeby.arbitrum.io/rpc',
    ],
    name: 'Arbitrum Testnet',
    nativeCurrency: ETH,
    blockExplorerUrls: ['https://testnet.arbiscan.io'],
  },
  // Polygon
  137: {
    urls: [
      process.env.infuraKey ? `https://polygon-mainnet.infura.io/v3/${process.env.infuraKey}` : undefined,
      'https://polygon-rpc.com',
    ],
    name: 'Polygon Mainnet',
    nativeCurrency: MATIC,
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  80001: {
    urls: [process.env.infuraKey ? `https://polygon-mumbai.infura.io/v3/${process.env.infuraKey}` : undefined],
    name: 'Polygon Mumbai',
    nativeCurrency: MATIC,
    blockExplorerUrls: ['https://mumbai.polygonscan.com'],
  },
};

export const URLS: { [chainId: number]: string[] } = Object.keys(CHAINS).reduce((accumulator, chainId) => {
  const validURLs = CHAINS[Number(chainId)].urls;

  if (validURLs.length) {
    accumulator[chainId] = validURLs;
  }

  return accumulator;
}, {});

export const SUPPORTED_CHAIN_IDS = [1, 4, 5];
