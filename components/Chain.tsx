import tw from 'tailwind-styled-components';
import { CHAINS } from '../config/chains';
import useConnector from '../hooks/useConnector';
import AssetLogo from './common/AssetLogo';

const Container = tw.div`flex align-middle justify-between items-center`;
const NameWrap = tw.div`ml-2 align-middle`;

const Chain = () => {
  const { chainId } = useConnector();
  return (
    <Container>
      <AssetLogo image="ETH" />
      <NameWrap>{CHAINS[chainId].name}</NameWrap>
    </Container>
  );
};

export default Chain;
