import { ContractTransaction } from 'ethers';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useSWRConfig } from 'swr';
import { CHAINS, ExtendedChainInformation } from '../config/chains';
import useConnector from './useConnector';
import useToasty from './useToasty';

const useTransaction = () => {
  const { account, chainId } = useConnector();
  const { mutate } = useSWRConfig();
  const { toasty } = useToasty();

  const explorer = (CHAINS[chainId!] as ExtendedChainInformation)?.blockExplorerUrls![0];

  const [isTransacting, setIsTransacting] = useState<boolean>(false);
  const [txSubmitted, setTxSubmitted] = useState<boolean>(false);

  const transact = async (promise: () => Promise<ContractTransaction | undefined> | undefined, description: string) => {
    try {
      setIsTransacting(true);
      setTxSubmitted(false);

      const res = await promise();

      setIsTransacting(false);
      setTxSubmitted(true);

      res &&
        toasty(
          async () => {
            await res?.wait();
            mutate(`/pools/${chainId}/${account}`);
          },
          description,
          explorer && `${explorer}/tx/${res.hash}`
        );
      return res;
    } catch (e) {
      console.log(e);
      toast.error('Transaction failed or rejected');

      setIsTransacting(false);
      setTxSubmitted(false);
    }
  };

  return { transact, isTransacting, txSubmitted };
};

export default useTransaction;
