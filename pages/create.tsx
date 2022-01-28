import tw from 'tailwind-styled-components';
import CreatePool from '../components/CreatePool';

const Container = tw.div`p-10 text-center align-middle justify-center`;

const Create = () => {
  return (
    <Container>
      <CreatePool />
    </Container>
  );
};

export default Create;
