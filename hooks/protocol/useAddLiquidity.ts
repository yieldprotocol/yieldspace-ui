import { useState } from 'react';
import { BigNumber, ethers, PayableOverrides } from 'ethers';
import { cleanValue } from '../../utils/appUtils';

import { calcPoolRatios, calculateSlippage, fyTokenForMint, splitLiquidity } from '../../utils/yieldMath';
import { IPool } from '../../lib/protocol/types';
import useConnector from '../useConnector';
import { AddLiquidityActions } from '../../lib/protocol/liquidity/types';
import useSignature from '../useSignature';
import { toast } from 'react-toastify';

export const useAddLiquidity = (pool: IPool) => {
  // settings
  const slippageTolerance = 0.001;

  const { account } = useConnector();
  const { signer } = useSignature();

  const [isAddingLiquidity, setIsAddingLiquidity] = useState<boolean>(false);

  const addLiquidity = async (
    input: string,
    method: AddLiquidityActions = AddLiquidityActions.MINT_WITH_BASE,
    description: string | null = null
  ) => {
    setIsAddingLiquidity(true);

    const erc20Contract = pool.base.contract.connect(signer!);
    const fyTokenContract = pool.fyToken.contract.connect(signer!);
    const poolContract = pool.contract.connect(signer!);

    const base = pool.base;
    const cleanInput = cleanValue(input, base.decimals);
    const _input = ethers.utils.parseUnits(cleanInput, base.decimals);
    const _inputLessSlippage = _input;

    // const _inputLessSlippage = calculateSlippage(_input, slippageTolerance.toString(), true);

    const [cachedBaseReserves, cachedFyTokenReserves] = await pool.contract.getCache();
    const cachedRealReserves = cachedFyTokenReserves.sub(pool.totalSupply);

    const [_fyTokenToBeMinted] = fyTokenForMint(
      cachedBaseReserves,
      cachedRealReserves,
      cachedFyTokenReserves,
      _inputLessSlippage,
      pool.getTimeTillMaturity(),
      pool.ts,
      pool.g1,
      pool.decimals,
      slippageTolerance
    );

    const [minRatio, maxRatio] = calcPoolRatios(cachedBaseReserves, cachedRealReserves);

    const [_baseToPool, _baseToFyToken] = splitLiquidity(
      cachedBaseReserves,
      cachedRealReserves,
      _inputLessSlippage,
      true
    ) as [BigNumber, BigNumber];

    const _baseToPoolWithSlippage = BigNumber.from(calculateSlippage(_baseToPool, slippageTolerance.toString()));

    /* if approveMAx, check if signature is still required */
    const alreadyApproved = (await base.getAllowance(account!, pool.address)).gt(_input);

    const _mintWithBase = async (overrides: PayableOverrides): Promise<ethers.ContractTransaction> => {
      const [, res] = await Promise.all([
        await erc20Contract.transfer(pool.address, _inputLessSlippage),
        await poolContract.mintWithBase(account!, account!, _fyTokenToBeMinted, minRatio, maxRatio, overrides),
      ]);
      return res;
    };

    const _mint = async (overrides: PayableOverrides): Promise<ethers.ContractTransaction> => {
      const [, , res] = await Promise.all([
        await erc20Contract.transfer(pool.address, _inputLessSlippage),
        await fyTokenContract.transfer(pool.address, _inputLessSlippage),
        await poolContract.mint(account!, account!, minRatio, maxRatio, overrides),
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

      if (method === AddLiquidityActions.MINT_WITH_BASE) {
        res = await _mintWithBase(overrides);
      } else {
        res = await _mint(overrides);
      }

      toast.promise(res.wait, {
        pending: `Pending: ${description}`,
        success: `Success: ${description}`,
        error: `Failed: ${description}`,
      });
    } catch (e) {
      console.log(e);
      toast.error('tx failed or rejected');
      setIsAddingLiquidity(false);
    }
    setIsAddingLiquidity(false);
  };

  return { addLiquidity, isAddingLiquidity };
};
