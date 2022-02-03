import tw from 'tailwind-styled-components';
import TradeWidget from '../components/trade/TradeWidget';

const Container = tw.div`text-center align-middle justify-center`;

const Trade = () => (
  <Container>
    <TradeWidget />
  </Container>
);

export default Trade;
