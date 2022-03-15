import { useSWRConfig } from 'swr';
import { useState } from 'react';
import { BigNumberish, ethers, PayableOverrides } from 'ethers';
import { cleanValue } from '../../utils/appUtils';

import { calculateSlippage } from '../../utils/yieldMath';
import { IPool } from '../../lib/protocol/types';
import useConnector from '../useConnector';
import useSignature from '../useSignature';
import { toast } from 'react-toastify';
import { TradeActions } from '../../lib/protocol/trade/types';
import useTradePreview from './useTradePreview';
import useLadle from './useLadle';

export const useTrade = (
  pool: IPool | undefined,
  fromInput: string,
  toInput: string,
  method: TradeActions = TradeActions.SELL_BASE,
  description: string | null = null,
  slippageTolerance: number = 0.05
) => {
  const { mutate } = useSWRConfig();
  const { account } = useConnector();
  const { sign } = useSignature();
  const { ladleContract, forwardPermitAction, batch, transferAction, sellBaseAction, sellFYTokenAction } = useLadle();

  const decimals = pool?.decimals;
  const cleanFromInput = cleanValue(fromInput, decimals);
  const cleanToInput = cleanValue(toInput, decimals);
  const _inputToUse = ethers.utils.parseUnits(cleanFromInput || '0', decimals);

  const fyTokenOutput = [TradeActions.SELL_BASE, TradeActions.BUY_FYTOKEN].includes(method);

  const { fyTokenOutPreview, baseOutPreview } = useTradePreview(
    pool,
    method,
    cleanFromInput,
    cleanToInput,
    fyTokenOutput
  );

  const [isTransacting, setIsTransacting] = useState<boolean>(false);
  const [tradeSubmitted, setTradeSubmitted] = useState<boolean>(false);

  const trade = async () => {
    if (!pool) throw new Error('no pool'); // prohibit trade if there is no pool
    setTradeSubmitted(false);
    setIsTransacting(true);

    const { base, fyToken, contract } = pool;

    /* check if signature is still required */
    const alreadyApproved = (await pool.base.getAllowance(account!, pool.address)).gt(_inputToUse);

    const _sellBase = async (overrides: PayableOverrides): Promise<ethers.ContractTransaction | undefined> => {
      const _fyTokenOutPreview = ethers.utils.parseUnits(fyTokenOutPreview, decimals);
      const _outputLessSlippage = calculateSlippage(_fyTokenOutPreview, slippageTolerance.toString(), true);
      const permits = await sign([
        {
          target: pool.base,
          spender: ladleContract?.address!,
          amount: _inputToUse,
          ignoreIf: alreadyApproved,
        },
      ]);
      const [, , , deadline, v, r, s] = permits[0].args!;

      const res = await batch(
        [
          forwardPermitAction(
            base?.address!,
            ladleContract?.address!,
            _inputToUse,
            deadline as BigNumberish,
            v as BigNumberish,
            r as Buffer,
            s as Buffer
          )!,
          transferAction(base.address, pool.address, _inputToUse)!,
          sellBaseAction(contract, account!, _outputLessSlippage)!,
        ],
        overrides
      );

      return res;
    };

    const _sellFYToken = async (overrides: PayableOverrides): Promise<ethers.ContractTransaction | undefined> => {
      const _baseOutPreview = ethers.utils.parseUnits(baseOutPreview, decimals);
      const _outputLessSlippage = calculateSlippage(_baseOutPreview, slippageTolerance.toString(), true);
      const permits = await sign([
        {
          target: pool.fyToken,
          spender: ladleContract?.address!,
          amount: _inputToUse,
          ignoreIf: alreadyApproved,
        },
      ]);
      const [, , , deadline, v, r, s] = permits[0].args!;

      const res = await batch(
        [
          forwardPermitAction(
            fyToken?.address!,
            ladleContract?.address!,
            _inputToUse,
            deadline as BigNumberish,
            v as BigNumberish,
            r as Buffer,
            s as Buffer
          )!,
          transferAction(fyToken.address, account!, _inputToUse)!,
          sellFYTokenAction(contract, account!, _outputLessSlippage)!,
        ],
        overrides
      );

      return res;
    };

    /**
     * Transact
     * */
    const overrides = {
      gasLimit: 250000,
    };

    try {
      let res: ethers.ContractTransaction | undefined;

      if (fyTokenOutput) {
        res = await _sellBase(overrides);
      } else {
        res = await _sellFYToken(overrides);
      }

      setIsTransacting(false);
      setTradeSubmitted(true);

      res &&
        toast.promise(
          async () => {
            await res?.wait();
            mutate('/pools');
          },
          {
            pending: `${description}`,
            success: `${description}`,
            error: `Could not ${description}`,
          }
        );
    } catch (e) {
      console.log(e);
      toast.error('Transaction failed or rejected');
      setIsTransacting(false);
      setTradeSubmitted(false);
    }
  };

  return { trade, isTransacting, tradeSubmitted };
};
