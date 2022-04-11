import { useWeb3React } from '@web3-react/core';
import tw from 'tailwind-styled-components';
import { CHAINS } from '../config/chains';
import AssetLogo from './common/AssetLogo';

const Container = tw.div`flex gap-2 items-center px-2 dark:bg-gray-700/50 border-[1px] dark:border-gray-700 border-gray-300 dark:text-gray-50 text-gray-800 rounded-md bg-gray-300`;
const NameWrap = tw.div`align-middle`;

const Chain = () => {
  const { chainId } = useWeb3React();
  if (!chainId) return null;
  return (
    <Container>
      <AssetLogo image="ETH" />
      <NameWrap>{CHAINS[chainId].name}</NameWrap>
    </Container>
  );
};

export default Chain;
