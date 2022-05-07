import { ethers } from 'ethers';
import useSWR from 'swr';
import { useAccount, useNetwork, useProvider } from 'wagmi';

function useETHBalance() {
  const { data: account } = useAccount();
  const provider = useProvider();
  const { activeChain } = useNetwork();

  const _getBalance = async () =>
    provider && account ? ethers.utils.formatEther(await provider.getBalance(account?.address!)) : '0';

  const { data } = useSWR(`/ethBalance/${activeChain?.id!}/${account}`, _getBalance);

  return { balance: data };
}

export default useETHBalance;
