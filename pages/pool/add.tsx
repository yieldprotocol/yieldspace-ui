import tw from 'tailwind-styled-components';
import AddLiquidity from '../../components/pool/AddLiquidity';

const Container = tw.div`text-center align-middle justify-center`;

const Create = () => (
  <Container>
    <AddLiquidity />
  </Container>
);

export default Create;
