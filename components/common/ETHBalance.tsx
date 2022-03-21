import tw from 'tailwind-styled-components';
import useConnector from '../../hooks/useConnector';
import { cleanValue } from '../../utils/appUtils';
import AssetLogo from './AssetLogo';
import useETHBalance from '../../hooks/useEthBalance';

const Container = tw.div`flex gap-1 items-center px-2 dark:bg-gray-700/50 border-[1px] dark:border-gray-700 border-gray-300 dark:text-gray-50 text-gray-800 rounded-md bg-gray-300`;
const Inner = tw.div`p-1 text-sm`;

const ETHBalance = () => {
  const { provider, account } = useConnector();
  const balance = useETHBalance(provider, account!);

  return (
    <Container>
      <AssetLogo image="ETH" />
      <Inner>{balance ? cleanValue(balance, 2) : '0'}</Inner>
    </Container>
  );
};

export default ETHBalance;
