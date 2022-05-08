import useSWR from 'swr';
import { useAccount, useBalance, useNetwork } from 'wagmi';

function useETHBalance() {
  const { data: account } = useAccount();
  const { activeChain } = useNetwork();
  const { data: balance } = useBalance({ addressOrName: account?.address, chainId: activeChain?.id });

  const _getBalance = async () => (account ? balance?.formatted : '0');

  const { data } = useSWR(`/ethBalance/${activeChain?.id!}/${account?.address}`, _getBalance);

  return { balance: data };
}

export default useETHBalance;
