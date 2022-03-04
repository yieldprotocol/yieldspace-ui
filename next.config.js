/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  env: {
    infuraKey: process.env.INFURA_KEY,
    defaultChainId: process.env.DEFAULT_CHAIN_ID,
    alchemyKeyArbitrumRinkeby: process.env.ALCHEMY_KEY_ARBITRUM_RINKEBY,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/trade',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
