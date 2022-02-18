import { ethers, PayableOverrides } from 'ethers';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { RemoveLiquidityActions } from '../../lib/protocol/liquidity/types';
import { IPool } from '../../lib/protocol/types';
import { cleanValue } from '../../utils/appUtils';
import { burn, calcPoolRatios } from '../../utils/yieldMath';
import useConnector from '../useConnector';
import useSignature from '../useSignature';

export const useRemoveLiquidity = (pool: IPool) => {
  // settings
  const approveMax = false;
  const slippageTolerance = 0.001;

  const { account } = useConnector();
  const { signer } = useSignature();

  const [isRemovingLiq, setIsRemovingLiq] = useState<boolean>(false);

  const removeLiquidity = async (
    input: string,
    method: RemoveLiquidityActions = RemoveLiquidityActions.BURN_FOR_BASE,
    description: string | null = null
  ) => {
    setIsRemovingLiq(true);

    const poolContract = pool.contract.connect(signer!);

    const base = pool.base;
    const cleanInput = cleanValue(input, base.decimals);
    const _input = ethers.utils.parseUnits(cleanInput, base.decimals);
    const _inputLessSlippage = _input;

    const [cachedBaseReserves, cachedFyTokenReserves] = await pool.contract.getCache();
    const cachedRealReserves = cachedFyTokenReserves.sub(pool.totalSupply);

    const [_baseTokenReceived, _fyTokenReceived] = burn(
      pool.baseReserves,
      cachedRealReserves,
      pool.totalSupply,
      _inputLessSlippage
    );

    const [minRatio, maxRatio] = calcPoolRatios(cachedBaseReserves, cachedRealReserves);

    const _burnForBase = async (overrides: PayableOverrides): Promise<ethers.ContractTransaction> => {
      const [res] = await Promise.all([poolContract.burnForBase(account!, minRatio, maxRatio, overrides)]);
      return res;
    };

    const _burn = async (overrides: PayableOverrides): Promise<ethers.ContractTransaction> => {
      const [res] = await Promise.all([poolContract.burn(account!, account!, minRatio, maxRatio, overrides)]);
      return res;
    };

    // transact
    const overrides = {
      gasLimit: 250000,
    };

    try {
      let res: ethers.ContractTransaction;

      if (method === RemoveLiquidityActions.BURN_FOR_BASE) {
        res = await _burnForBase(overrides);
      } else {
        res = await _burn(overrides);
      }

      toast.promise(res.wait, {
        pending: `Pending: ${description}`,
        success: `Success: ${description}`,
        error: `Failed: ${description}`,
      });
    } catch (e) {
      console.log(e);
      toast.error('tx failed or rejected');
      setIsRemovingLiq(false);
    }
    setIsRemovingLiq(false);
  };

  return { removeLiquidity, isRemovingLiq };
};
