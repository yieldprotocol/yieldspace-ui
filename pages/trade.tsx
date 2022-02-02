import tw from 'tailwind-styled-components';
import TradeWidget from '../components/Trade/TradeWidget';

const Container = tw.div`text-center align-middle justify-center`;

const Trade = () => (
  <Container>
    <TradeWidget />
  </Container>
);

export default Trade;
