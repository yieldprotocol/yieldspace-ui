import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Web3ReactHooks } from '@web3-react/core';

function useETHBalance(provider?: ReturnType<Web3ReactHooks['useProvider']>, account?: string): string | undefined {
  const [balance, setBalance] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      if (provider && account) {
        setBalance(ethers.utils.formatEther(await provider.getBalance(account)));
      }
    })();
  }, [provider, account]);

  return balance;
}

export default useETHBalance;
