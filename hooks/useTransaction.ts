import { ContractTransaction } from 'ethers';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useSWRConfig } from 'swr';
import { useAccount, useBalance, useNetwork } from 'wagmi';
import useToasty from './useToasty';

const useTransaction = () => {
  const { data: account } = useAccount();
  const { activeChain } = useNetwork();
  const { refetch } = useBalance({ addressOrName: account?.address, chainId: activeChain?.id });
  const { mutate } = useSWRConfig();
  const { toasty } = useToasty();

  const chainId = activeChain?.id;
  const explorer = activeChain?.blockExplorers?.default.url;

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
              mutate(`/pools/${chainId}/${account?.address}`);
              refetch(); // refetch ETH balance
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
