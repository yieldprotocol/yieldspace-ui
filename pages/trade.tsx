import dynamic from 'next/dynamic';
import tw from 'tailwind-styled-components';

const DynamicTradeWidget = dynamic(() => import('../components/trade/TradeWidget'), { ssr: false });

const Container = tw.div`text-center align-middle justify-center`;

const Trade = () => (
  <Container>
    <DynamicTradeWidget />
  </Container>
);

export default Trade;
