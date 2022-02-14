import { BigNumber, ethers } from 'ethers';
import { cleanValue } from '../../utils/appUtils';
// import { BLANK_VAULT } from '../../utils/constants';
import useTransaction from '../useTransaction';

import { calcPoolRatios, calculateSlippage, fyTokenForMint, splitLiquidity } from '../../utils/yieldMath';
import { IPool } from '../../lib/protocol/types';
import useContracts from './useContracts';
import useConnector from '../useConnector';
import { LADLE } from '../../constants';
import { AddLiquidityType } from '../../lib/protocol/liquidity/types';
import { ICallData } from '../../lib/tx/types';
import { LadleActions, RoutedActions } from '../../lib/tx/operations';

export const useAddLiquidity = (pool: IPool, description?: string | null) => {
  const { provider, chainId, account } = useConnector();
  const contracts = useContracts(provider!, chainId!);
  const slippageTolerance = 0.001;

  const { sign, transact } = useTransaction(pool, description!);

  const addLiquidity = async (input: string, method: AddLiquidityType = AddLiquidityType.BUY) => {
    console.log('adding liq', input, method);
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

    /**
     * GET SIGNATURE/APPROVAL DATA
     * */
    const permit = await sign([
      {
        target: base,
        spender: pool.address,
        amount: _input,
        ignoreIf: alreadyApproved === true,
      },
    ]);
    console.log('🦄 ~ file: useAddLiquidity.ts ~ line 72 ~ addLiquidity ~  permit ', permit);

    /**
     * BUILD CALL DATA ARRAY
     * */
    const call: ICallData[] = [
      ...permit,
      /**
       * Provide liquidity by BUYING :
       * */
      {
        operation: RoutedActions.Fn.MINT_WITH_BASE,
        args: [account, account, _fyTokenToBeMinted, minRatio, maxRatio] as RoutedActions.Args.MINT_WITH_BASE,
        fnName: RoutedActions.Fn.MINT_WITH_BASE,
        targetContract: pool.contract,
        ignoreIf: method !== AddLiquidityType.BUY, // ignore if not BUY and POOL
      },

      /**
       * Provide liquidity by BORROWING:
       * */
      // {
      //   operation: LadleActions.Fn.BUILD,
      //   args: [series.id, base.idToUse, '0'] as LadleActions.Args.BUILD,
      //   ignoreIf: method !== AddLiquidityType.BORROW ? true : !!matchingVaultId, // ingore if not BORROW and POOL
      // },
      // {
      //   operation: LadleActions.Fn.TRANSFER,
      //   args: [base.address, base.joinAddress, _baseToFyToken] as LadleActions.Args.TRANSFER,
      //   ignoreIf: method !== AddLiquidityType.BORROW,
      // },
      // {
      //   operation: LadleActions.Fn.TRANSFER,
      //   args: [base.address, series.poolAddress, _baseToPoolWithSlippage] as LadleActions.Args.TRANSFER,
      //   ignoreIf: method !== AddLiquidityType.BORROW,
      // },
      // {
      //   operation: LadleActions.Fn.POUR,
      //   args: [
      //     matchingVaultId || BLANK_VAULT,
      //     series.poolAddress,
      //     _baseToFyToken,
      //     _baseToFyToken,
      //   ] as LadleActions.Args.POUR,
      //   ignoreIf: method !== AddLiquidityType.BORROW,
      // },
      // {
      //   operation: LadleActions.Fn.ROUTE,
      //   args: [strategy.id || account, account, minRatio, maxRatio] as RoutedActions.Args.MINT_POOL_TOKENS,
      //   fnName: RoutedActions.Fn.MINT_POOL_TOKENS,
      //   targetContract: series.poolContract,
      //   ignoreIf: method !== AddLiquidityType.BORROW,
      // },
    ];

    await transact(call);
    // updateSeries([series]);
    // updateAssets([base]);
    // updateStrategies([strategy]);
    // updateStrategyHistory([strategy]);
    // updateVaults([]);
  };

  return addLiquidity;
};
