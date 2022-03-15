import { useSWRConfig } from 'swr';
import { useState } from 'react';
import { BigNumber, BigNumberish, ethers, PayableOverrides } from 'ethers';
import { cleanValue } from '../../utils/appUtils';

import { calcPoolRatios, calculateSlippage, fyTokenForMint, mint, splitLiquidity } from '../../utils/yieldMath';
import { IPool } from '../../lib/protocol/types';
import useConnector from '../useConnector';
import { AddLiquidityActions } from '../../lib/protocol/liquidity/types';
import useSignature from '../useSignature';
import { toast } from 'react-toastify';
import useLadle from './useLadle';

export const useAddLiquidity = (
  pool: IPool,
  input: string,
  method: AddLiquidityActions = AddLiquidityActions.MINT_WITH_BASE,
  description: string | null = null
) => {
  // settings
  const slippageTolerance = 0.001;

  const { mutate } = useSWRConfig();
  const { account } = useConnector();
  const { sign } = useSignature();
  const { ladleContract, forwardPermitAction, batch, transferAction, mintWithBaseAction, mintAction } = useLadle();

  const [isAddingLiquidity, setIsAddingLiquidity] = useState<boolean>(false);
  const [addSubmitted, setAddSubmitted] = useState<boolean>(false);

  const addLiquidity = async () => {
    if (!pool) throw new Error('no pool'); // prohibit trade if there is no pool
    setAddSubmitted(false);
    setIsAddingLiquidity(true);

    const { base, fyToken } = pool;
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

    /* if approveMax, check if signature is still required */
    const alreadyApproved = (await base.getAllowance(account!, pool.address)).gt(_input);

    const _mintWithBase = async (overrides: PayableOverrides): Promise<ethers.ContractTransaction | undefined> => {
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

    const _mint = async (overrides: PayableOverrides): Promise<ethers.ContractTransaction | undefined> => {
      const permits = await sign([
        {
          target: pool.base,
          spender: ladleContract?.address!,
          amount: _input,
          ignoreIf: alreadyApproved,
        },
        {
          target: pool.fyToken,
          spender: ladleContract?.address!,
          amount: _input,
          ignoreIf: alreadyApproved,
        },
      ]);
      const [, , , baseDeadline, baseV, baseR, baseS] = permits[0].args!;
      const [, , , fyDeadline, fyV, fyR, fyS] = permits[1].args!;

      const res = await batch(
        [
          forwardPermitAction(
            base.address,
            ladleContract?.address!,
            _input,
            baseDeadline as BigNumberish,
            baseV as BigNumberish,
            baseR as Buffer,
            baseS as Buffer
          )!,
          forwardPermitAction(
            fyToken.address,
            ladleContract?.address!,
            _input,
            fyDeadline as BigNumberish,
            fyV as BigNumberish,
            fyR as Buffer,
            fyS as Buffer
          )!,
          transferAction(base.address, pool.address, _input)!,
          transferAction(fyToken.address, pool.address, _input)!,
          mintAction(pool.contract, account!, account!, minRatio, maxRatio)!,
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

      if (method === AddLiquidityActions.MINT_WITH_BASE) {
        res = await _mintWithBase(overrides);
      } else {
        res = await _mint(overrides);
      }

      setIsAddingLiquidity(false);
      setAddSubmitted(true);

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
      toast.error('tx failed or rejected');
      setIsAddingLiquidity(false);
      setAddSubmitted(false);
    }
  };

  return { addLiquidity, isAddingLiquidity, addSubmitted };
};
