import { useState } from 'react';
import { ethers, PayableOverrides } from 'ethers';
import { cleanValue } from '../../utils/appUtils';

import { calculateSlippage } from '../../utils/yieldMath';
import { IPool } from '../../lib/protocol/types';
import useConnector from '../useConnector';
import useSignature from '../useSignature';
import { toast } from 'react-toastify';
import { TradeActions } from '../../lib/protocol/trade/types';
import { MAX_256 } from '../../constants';

export const useTrade = (pool: IPool) => {
  // settings
  const slippageTolerance = 0.001;

  const { account } = useConnector();
  const { signer } = useSignature();

  const [isTrading, setIsTrading] = useState<boolean>(false);

  const trade = async (
    input: string,
    method: TradeActions = TradeActions.SELL_BASE,
    description: string | null = null
  ) => {
    setIsTrading(true);

    const erc20Contract = pool.base.contract.connect(signer!);
    const fyTokenContract = pool.fyToken.contract.connect(signer!);
    const poolContract = pool.contract.connect(signer!);

    const base = pool.base;
    const cleanInput = cleanValue(input, base.decimals);
    const _input = ethers.utils.parseUnits(cleanInput, base.decimals);
    // const _outputLessSlippage = calculateSlippage(_input, slippageTolerance.toString(), true);
    const _outputLessSlippage = MAX_256;

    /* check if signature is still required */
    const alreadyApproved = (await base.getAllowance(account!, pool.address)).gt(_input);

    const _sellBase = async (overrides: PayableOverrides): Promise<ethers.ContractTransaction> => {
      const [, res] = await Promise.all([
        await erc20Contract.transfer(pool.address, _input),
        await poolContract.sellBase(account!, _outputLessSlippage, overrides),
      ]);
      return res;
    };

    const _sellFYToken = async (overrides: PayableOverrides): Promise<ethers.ContractTransaction> => {
      const [, res] = await Promise.all([
        await erc20Contract.transfer(pool.address, _input),
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
