import { ethers, PayableOverrides } from 'ethers';
import { cleanValue } from '../../utils/appUtils';
import { calculateSlippage } from '../../utils/yieldMath';
import { IPool } from '../../lib/protocol/types';
import useConnector from '../useConnector';
import useSignature from '../useSignature';
import { TradeActions } from '../../lib/protocol/trade/types';
import useTradePreview from './useTradePreview';
import useLadle from './useLadle';
import useTransaction from '../useTransaction';

export const useTrade = (
  pool: IPool,
  fromInput: string,
  toInput: string,
  method: TradeActions,
  description: string,
  slippageTolerance: number = 0.05
) => {
  const { account } = useConnector();
  const { sign } = useSignature();
  const { handleTransact, isTransacting, txSubmitted } = useTransaction();
  const { ladleContract, batch, transferAction, sellBaseAction, sellFYTokenAction, wrapETHAction, exitETHAction } =
    useLadle();

  // input data
  const cleanFromInput = cleanValue(fromInput, pool?.decimals);
  const cleanToInput = cleanValue(toInput, pool?.decimals);
  const _inputToUse = ethers.utils.parseUnits(cleanFromInput || '0', pool?.decimals);
  const { fyTokenOutPreview, baseOutPreview } = useTradePreview(pool, method, cleanFromInput, cleanToInput);

  const trade = async () => {
    if (!pool) throw new Error('no pool'); // prohibit trade if there is no pool
    const { base, fyToken, contract: poolContract, address: poolAddress, decimals } = pool;
    const isEth = base.symbol === 'ETH';
    const overrides = {
      gasLimit: 250000,
    };
    const withEthOverrides = { ...overrides, value: isEth ? _inputToUse : undefined } as PayableOverrides;

    const _sellBase = async () => {
      const baseAlreadyApproved = (await base.getAllowance(account!, ladleContract?.address!)).gte(_inputToUse);

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
          { action: wrapETHAction(poolContract, _inputToUse)!, ignoreIf: !isEth },
          { action: transferAction(base.address, poolAddress, _inputToUse)!, ignoreIf: isEth },
          {
            action: sellBaseAction(poolContract, account!, _outputLessSlippage)!,
          },
          { action: exitETHAction(account!)!, ignoreIf: !isEth }, // leftover eth gets sent back to account
        ],
        withEthOverrides
      );
    };

    const _sellFYToken = async () => {
      const fyTokenAlreadyApproved = (await fyToken.getAllowance(account!, ladleContract?.address!)).gte(_inputToUse);

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
