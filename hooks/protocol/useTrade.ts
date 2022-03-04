import { useState } from 'react';
import { ethers, PayableOverrides } from 'ethers';
import { cleanValue } from '../../utils/appUtils';

import { calculateSlippage } from '../../utils/yieldMath';
import { IPool } from '../../lib/protocol/types';
import useConnector from '../useConnector';
import useSignature from '../useSignature';
import { toast } from 'react-toastify';
import { TradeActions } from '../../lib/protocol/trade/types';
import useTradePreview from './useTradePreview';

export const useTrade = (
  pool: IPool | undefined,
  fromInput: string,
  toInput: string,
  method: TradeActions = TradeActions.SELL_BASE,
  description: string | null = null
) => {
  // settings
  const slippageTolerance = 0.001;

  const { account } = useConnector();
  const { signer } = useSignature();

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
    setIsTransacting(true);

    const erc20Contract = pool.base.contract.connect(signer!);
    const fyTokenContract = pool.fyToken.contract.connect(signer!);
    const poolContract = pool.contract.connect(signer!);

    /* check if signature is still required */
    // const alreadyApproved = (await pool.base.getAllowance(account!, pool.address)).gt(_input);

    const _sellBase = async (overrides: PayableOverrides): Promise<ethers.ContractTransaction> => {
      const _fyTokenOutPreview = ethers.utils.parseUnits(fyTokenOutPreview, decimals);
      const _outputLessSlippage = calculateSlippage(_fyTokenOutPreview, slippageTolerance.toString(), true);

      const [, res] = await Promise.all([
        await erc20Contract.transfer(pool.address, _inputToUse),
        await poolContract.sellBase(account!, _outputLessSlippage, overrides),
      ]);
      return res;
    };

    const _sellFYToken = async (overrides: PayableOverrides): Promise<ethers.ContractTransaction> => {
      const _baseOutPreview = ethers.utils.parseUnits(baseOutPreview, decimals);
      const _outputLessSlippage = calculateSlippage(_baseOutPreview, slippageTolerance.toString(), true);

      const [, res] = await Promise.all([
        await fyTokenContract.transfer(pool.address, _inputToUse),
        await poolContract.sellFYToken(account!, _outputLessSlippage, overrides),
      ]);
      return res;
    };

    /**
     * GET SIGNATURE/APPROVAL DATA
     * */
    // await sign([
    //   {
    //     target: base,
    //     spender: pool.address,
    //     amount: _input,
    //     ignoreIf: alreadyApproved === true,
    //   },
    // ]);

    /**
     * Transact
     * */
    const overrides = {
      gasLimit: 250000,
    };

    try {
      let res: ethers.ContractTransaction;

      if (fyTokenOutput) {
        res = await _sellBase(overrides);
      } else {
        res = await _sellFYToken(overrides);
      }

      setIsTransacting(false);
      setTradeSubmitted(true);

      toast.promise(res.wait, {
        pending: `${description}`,
        success: `${description}`,
        error: `Could not ${description}`,
      });
    } catch (e) {
      console.log(e);
      toast.error('Transaction failed or rejected');
      setIsTransacting(false);
      setTradeSubmitted(false);
    }
  };

  return { trade, isTransacting, tradeSubmitted };
};
