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
import { LadleActions } from '../../lib/tx/operations';
import { DAI_PERMIT_ASSETS } from '../../config/assets';
import useToasty from '../useToasty';
import { CHAINS, ExtendedChainInformation } from '../../config/chains';

export const useAddLiquidity = (
  pool: IPool,
  input: string,
  method: AddLiquidityActions = AddLiquidityActions.MINT_WITH_BASE,
  description: string | null = null
) => {
  // settings
  const slippageTolerance = 0.001;

  const { toasty } = useToasty();
  const { mutate } = useSWRConfig();
  const { account, chainId } = useConnector();
  const explorer = (CHAINS[chainId!] as ExtendedChainInformation).blockExplorerUrls![0];
  const { sign } = useSignature();
  const {
    ladleContract,
    forwardDaiPermitAction,
    forwardPermitAction,
    batch,
    transferAction,
    mintWithBaseAction,
    mintAction,
  } = useLadle();

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
      pool.getTimeTillMaturity().toString(),
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

      if (DAI_PERMIT_ASSETS.includes(pool.base.symbol)) {
        const [address, spender, nonce, deadline, allowed, v, r, s] = permits[0]
          .args as LadleActions.Args.FORWARD_DAI_PERMIT;

        return batch(
          [
            forwardDaiPermitAction(address, spender, nonce, deadline, allowed, v, r, s)!,
            transferAction(base.address, pool.address, _input)!,
            mintWithBaseAction(pool.contract, account!, account!, _fyTokenToBeMinted, minRatio, maxRatio)!,
          ],
          overrides
        );
      }

      const [token, spender, amount, deadline, v, r, s] = permits[0].args! as LadleActions.Args.FORWARD_PERMIT;

      return batch(
        [
          forwardPermitAction(token, spender, amount, deadline, v, r, s)!,
          transferAction(base.address, pool.address, _input)!,
          mintWithBaseAction(pool.contract, account!, account!, _fyTokenToBeMinted, minRatio, maxRatio)!,
        ],
        overrides
      );
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

      const [fyAddress, fySpender, fyAmount, fyDeadline, fyV, fyR, fyS] = permits[1]
        .args! as LadleActions.Args.FORWARD_PERMIT;

      if (DAI_PERMIT_ASSETS.includes(pool.base.symbol)) {
        const [baseAddress, baseSpender, baseNonce, baseDeadline, baseAllowed, baseV, baseR, baseS] = permits[0]
          .args! as LadleActions.Args.FORWARD_DAI_PERMIT;

        return batch(
          [
            forwardDaiPermitAction(
              baseAddress,
              baseSpender,
              baseNonce,
              baseDeadline,
              baseAllowed,
              baseV,
              baseR,
              baseS
            )!,
            forwardPermitAction(fyAddress, fySpender, fyAmount, fyDeadline, fyV, fyR, fyS)!,
            transferAction(baseAddress, pool.address, _input)!,
            transferAction(fyAddress, pool.address, fyAmount)!,
            mintAction(pool.contract, account!, account!, minRatio, maxRatio)!,
          ],
          overrides
        );
      }

      const [baseAddress, baseSpender, baseAmount, baseDeadline, baseV, baseR, baseS] = permits[0]
        .args! as LadleActions.Args.FORWARD_PERMIT;

      return batch(
        [
          forwardPermitAction(baseAddress, baseSpender, baseAmount, baseDeadline, baseV, baseR, baseS)!,
          forwardPermitAction(fyAddress, fySpender, fyAmount, fyDeadline, fyV, fyR, fyS)!,
          transferAction(baseAddress, pool.address, baseAmount)!,
          transferAction(fyAddress, pool.address, fyAmount)!,
          mintAction(pool.contract, account!, account!, minRatio, maxRatio)!,
        ],
        overrides
      );
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
        toasty(
          async () => {
            await res?.wait();
            mutate(`/pools/${chainId}/${account}`);
          },
          description!,
          explorer && `${explorer}/tx/${res.hash}`
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
