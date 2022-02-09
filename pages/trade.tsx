import dynamic from 'next/dynamic';

const DynamicTradeWidget = dynamic(() => import('../components/trade/TradeWidget'), { ssr: false });

const Trade = () => <DynamicTradeWidget />;

export default Trade;
