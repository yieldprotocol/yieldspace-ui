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
  pool: IPool,
  input: string,
  method: TradeActions = TradeActions.SELL_BASE,
  description: string | null = null
) => {
  // settings
  const slippageTolerance = 0.001;

  const { account } = useConnector();
  const { signer } = useSignature();

  const cleanInput = cleanValue(input, pool.decimals);
  const _input = ethers.utils.parseUnits(cleanInput, pool.decimals);

  const fyTokenOutput = method === (TradeActions.SELL_BASE || TradeActions.BUY_FYTOKEN);

  const { fyTokenOutPreview, baseOutPreview } = useTradePreview(pool, method, cleanInput, '', fyTokenOutput); // to amount not necessary here

  const [isTrading, setIsTrading] = useState<boolean>(false);

  const trade = async () => {
    setIsTrading(true);

    const erc20Contract = pool.base.contract.connect(signer!);
    const fyTokenContract = pool.fyToken.contract.connect(signer!);
    const poolContract = pool.contract.connect(signer!);

    /* check if signature is still required */
    // const alreadyApproved = (await pool.base.getAllowance(account!, pool.address)).gt(_input);

    const _sellBase = async (overrides: PayableOverrides): Promise<ethers.ContractTransaction> => {
      const _fyTokenOutPreview = ethers.utils.parseUnits(fyTokenOutPreview, pool.decimals);
      const _outputLessSlippage = calculateSlippage(_fyTokenOutPreview, slippageTolerance.toString(), true);
      const [, res] = await Promise.all([
        await erc20Contract.transfer(pool.address, _input),
        await poolContract.sellBase(account!, _outputLessSlippage, overrides),
      ]);
      return res;
    };

    const _sellFYToken = async (overrides: PayableOverrides): Promise<ethers.ContractTransaction> => {
      const _baseOutPreview = ethers.utils.parseUnits(baseOutPreview, pool.decimals);
      const _outputLessSlippage = calculateSlippage(_baseOutPreview, slippageTolerance.toString(), true);
      const [, res] = await Promise.all([
        await fyTokenContract.transfer(pool.address, _input),
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

      if (method === (TradeActions.SELL_BASE || TradeActions.BUY_FYTOKEN)) {
        res = await _sellBase(overrides);
      } else {
        res = await _sellFYToken(overrides);
      }

      toast.promise(res.wait, {
        pending: `Pending: ${description}`,
        success: `Success: ${description}`,
        error: `Failed: ${description}`,
      });
    } catch (e) {
      console.log(e);
      toast.error('tx failed or rejected');
      setIsTrading(false);
    }
    setIsTrading(false);
  };

  return { trade, isTrading };
};
