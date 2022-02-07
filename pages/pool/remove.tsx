import dynamic from 'next/dynamic';
import tw from 'tailwind-styled-components';

const DynamicRemoveLiquidity = dynamic(() => import('../../components/pool/RemoveLiquidity'), { ssr: false });

const Container = tw.div`p-10 text-center align-middle justify-center`;

const Create = () => (
  <Container>
    <DynamicRemoveLiquidity />
  </Container>
);

export default Create;
