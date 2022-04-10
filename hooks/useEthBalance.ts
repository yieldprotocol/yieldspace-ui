import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import useSWR from 'swr';

function useETHBalance() {
  const { account, provider, chainId } = useWeb3React();

  const _getBalance = async () =>
    provider && account ? ethers.utils.formatEther(await provider.getBalance(account)) : '0';

  const { data } = useSWR(`/ethBalance/${chainId}/${account}`, _getBalance);

  return { balance: data };
}

export default useETHBalance;
