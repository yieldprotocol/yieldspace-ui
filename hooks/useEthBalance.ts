import { ethers } from 'ethers';
import useSWR from 'swr';
import useConnector from './useConnector';

function useETHBalance() {
  const { account, provider, chainId } = useConnector();

  const _getBalance = async () =>
    provider && account ? ethers.utils.formatEther(await provider.getBalance(account)) : '0';

  const { data } = useSWR(`/ethBalance/${chainId}/${account}`, _getBalance);

  return { balance: data };
}

export default useETHBalance;
