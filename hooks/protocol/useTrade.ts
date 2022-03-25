import { ContractTransaction, ethers } from 'ethers';
import { cleanValue } from '../../utils/appUtils';

import { calculateSlippage } from '../../utils/yieldMath';
import { IPool } from '../../lib/protocol/types';
import useConnector from '../useConnector';
import useSignature from '../useSignature';
import { TradeActions } from '../../lib/protocol/trade/types';
import useTradePreview from './useTradePreview';
import useLadle from './useLadle';
import { LadleActions } from '../../lib/tx/operations';
import { DAI_PERMIT_ASSETS } from '../../config/assets';
import useTransaction from '../useTransaction';

export const useTrade = (
  pool: IPool | undefined,
  fromInput: string,
  toInput: string,
  method: TradeActions,
  description: string,
  slippageTolerance: number = 0.05
) => {
  const { account } = useConnector();
  const { sign } = useSignature();
  const { handleTransact, isTransacting, txSubmitted } = useTransaction();
  const {
    ladleContract,
    forwardDaiPermitAction,
    forwardPermitAction,
    batch,
    transferAction,
    sellBaseAction,
    sellFYTokenAction,
  } = useLadle();

  const decimals = pool?.decimals;
  const cleanFromInput = cleanValue(fromInput, decimals);
  const cleanToInput = cleanValue(toInput, decimals);
  const _inputToUse = ethers.utils.parseUnits(cleanFromInput || '0', decimals);

  const { fyTokenOutPreview, baseOutPreview } = useTradePreview(pool, method, cleanFromInput, cleanToInput);

  const overrides = {
    gasLimit: 250000,
  };

  const trade = async () => {
    if (!pool) throw new Error('no pool'); // prohibit trade if there is no pool

    const { base, fyToken, contract, address: poolAddress } = pool;

    const _sellBase = async (): Promise<ContractTransaction | undefined> => {
      const baseAlreadyApproved = (await base.getAllowance(account!, ladleContract?.address!)).gt(_inputToUse);

      const _outputLessSlippage = calculateSlippage(
        ethers.utils.parseUnits(fyTokenOutPreview, decimals),
        slippageTolerance.toString(),
        true
      );

      const permits = await sign([
        {
          target: base,
          spender: ladleContract?.address!,
          amount: _inputToUse,
          ignoreIf: baseAlreadyApproved,
        },
      ]);

      return batch(
        [
          ...permits,
          { action: transferAction(base.address, poolAddress, _inputToUse)! },
          { action: sellBaseAction(contract, account!, _outputLessSlippage)! },
        ],
        overrides
      );
    };

    const _sellFYToken = async (): Promise<ContractTransaction | undefined> => {
      const fyTokenAlreadyApproved = (await fyToken.getAllowance(account!, ladleContract?.address!)).gt(_inputToUse);

      const _outputLessSlippage = ethers.utils.parseUnits(
        calculateSlippage(baseOutPreview, slippageTolerance.toString(), true),
        decimals
      );

      const permits = await sign([
        {
          target: fyToken,
          spender: ladleContract?.address!,
          amount: _inputToUse,
          ignoreIf: fyTokenAlreadyApproved,
        },
      ]);

      return batch(
        [
          ...permits,
          { action: transferAction(fyToken.address, poolAddress, _inputToUse)! },
          { action: sellFYTokenAction(contract, account!, _outputLessSlippage)! },
        ],
        overrides
      );
    };

    handleTransact(method === TradeActions.SELL_BASE ? _sellBase : _sellFYToken, description);
  };

  return { trade, isTransacting, tradeSubmitted: txSubmitted };
};
