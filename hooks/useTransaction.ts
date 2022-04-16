import { useWeb3React } from '@web3-react/core';
import { ContractTransaction } from 'ethers';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useSWRConfig } from 'swr';
import { CHAINS, ExtendedChainInformation } from '../config/chains';
import useToasty from './useToasty';

const useTransaction = () => {
  const { account, chainId } = useWeb3React();
  const { mutate } = useSWRConfig();
  const { toasty } = useToasty();

  const explorer = (CHAINS[chainId!] as ExtendedChainInformation)?.blockExplorerUrls![0];

  const [isTransacting, setIsTransacting] = useState<boolean>(false);
  const [txSubmitted, setTxSubmitted] = useState<boolean>(false);

  const handleTransact = async (
    promise: () => Promise<ContractTransaction | undefined> | undefined,
    description: string
  ) => {
    try {
      setIsTransacting(true);
      setTxSubmitted(false);

      const res = await promise();

      setIsTransacting(false);
      setTxSubmitted(true);

      try {
        res &&
          toasty(
            async () => {
              await res?.wait();
              mutate(`/pools/${chainId}/${account}`);
              mutate(`/ethBalance/${chainId}/${account}`); // update eth balance
            },
            description,
            explorer && `${explorer}/tx/${res.hash}`
          );
        return res;
      } catch (e) {
        console.log(e);
        toast.error('Transaction failed');

        setIsTransacting(false);
        setTxSubmitted(false);
      }
    } catch (e) {
      console.log(e);
      toast.error('Transaction rejected');

      setIsTransacting(false);
      setTxSubmitted(false);
    }
  };

  return { handleTransact, isTransacting, txSubmitted };
};

export default useTransaction;
