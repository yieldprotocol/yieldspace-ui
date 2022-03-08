import { BigNumberish, ethers, PayableOverrides } from 'ethers';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { RemoveLiquidityActions } from '../../lib/protocol/liquidity/types';
import { IPool } from '../../lib/protocol/types';
import { cleanValue } from '../../utils/appUtils';
import { burn, calcPoolRatios } from '../../utils/yieldMath';
import useConnector from '../useConnector';
import useSignature from '../useSignature';
import useLadle from './useLadle';

export const useRemoveLiquidity = (pool: IPool) => {
  // settings
  const approveMax = false;
  const slippageTolerance = 0.001;

  const { account } = useConnector();
  const { sign } = useSignature();
  const { ladleContract, forwardPermitAction, batch, transferAction } = useLadle();

  const [isRemovingLiq, setIsRemovingLiq] = useState<boolean>(false);
  const [removeSubmitted, setRemoveSubmitted] = useState<boolean>(false);

  const removeLiquidity = async (
    input: string,
    method: RemoveLiquidityActions = RemoveLiquidityActions.BURN_FOR_BASE,
    description: string | null = null
  ) => {
    if (!pool) throw new Error('no pool'); // prohibit trade if there is no pool
    setRemoveSubmitted(false);
    setIsRemovingLiq(true);

    const { base, fyToken } = pool;
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

    const alreadyApproved = (await pool.contract.allowance(account!, ladleContract?.address!)).gt(_input);

    const _burnForBase = async (overrides: PayableOverrides): Promise<ethers.ContractTransaction> => {
      const permits = await sign([
        {
          target: pool.base,
          spender: ladleContract?.address!,
          amount: _input,
          ignoreIf: alreadyApproved,
        },
      ]);
      const [, , , deadline, v, r, s] = permits[0].args!;

      const res = await batch(
        [
          forwardPermitAction(
            base.address,
            ladleContract?.address!,
            _input,
            deadline as BigNumberish,
            v as BigNumberish,
            r as Buffer,
            s as Buffer
          )!,
          transferAction(base.address, pool.address, _input)!,
          mintWithBaseAction(pool.contract, account!, account!, _fyTokenToBeMinted, minRatio, maxRatio)!,
        ],
        overrides
      );

      return res;
    };

    const _burn = async (overrides: PayableOverrides): Promise<ethers.ContractTransaction> => {
      const [, res] = await Promise.all([
        poolContract.transfer(pool.address, _inputLessSlippage, overrides),
        poolContract.burn(account!, account!, minRatio, maxRatio, overrides),
      ]);
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
