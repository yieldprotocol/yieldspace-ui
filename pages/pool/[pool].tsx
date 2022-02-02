import tw from 'tailwind-styled-components';
import PoolItem from '../../components/pool/PoolItem';

const Container = tw.div`p-10 text-center align-middle justify-center`;

const PoolItemPage = () => {
  return (
    <Container>
      <PoolItem />
    </Container>
  );
};

export default PoolItemPage;
