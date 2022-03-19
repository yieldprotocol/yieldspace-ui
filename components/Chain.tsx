import tw from 'tailwind-styled-components';
import { CHAINS } from '../config/chains';
import useConnector from '../hooks/useConnector';
import AssetLogo from './common/AssetLogo';

const Container = tw.div`flex gap-1 items-center px-2 dark:bg-gray-700/50 border-[1px] dark:border-gray-700 border-gray-300 dark:text-gray-50 text-gray-800 rounded-md bg-gray-300`;
const NameWrap = tw.div`ml-2 align-middle`;

const Chain = () => {
  const { chainId } = useConnector();
  if (!chainId) return null;
  return (
    <Container>
      <AssetLogo image="ETH" />
      <NameWrap>{CHAINS[chainId].name}</NameWrap>
    </Container>
  );
};

export default Chain;
