import tw from 'tailwind-styled-components';
import AddLiquidity from '../../components/pool/AddLiquidity';

const Container = tw.div`p-10 text-center align-middle justify-center`;

const Create = () => {
  return (
    <Container>
      <AddLiquidity />
    </Container>
  );
};

export default Create;