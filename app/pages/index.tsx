import deployment from '@reimbursement-token/contracts/deploys/localhost.json';
import tw from 'tailwind-styled-components';

const Container = tw.div`text-green-800`;

const Index = () => {
  return (
    <Container>
      <p>Contract deployments:</p>
      <ul>{JSON.stringify(deployment)}</ul>
    </Container>
  );
};

export default Index;
