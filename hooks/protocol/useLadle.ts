import { BigNumberish, ContractTransaction, PayableOverrides } from 'ethers';
import { LADLE } from '../../constants';
import { Ladle, Pool } from '../../contracts/types';
import { LadleActions, RoutedActions } from '../../lib/tx/operations';
import useSignature from '../useSignature';
import useContracts from './useContracts';

const useLadle = () => {
  const contracts = useContracts();
  const { signer } = useSignature();
  const ladle = contracts ? (contracts![LADLE]?.connect(signer!) as Ladle) : undefined;

  const forwardDaiPermitAction = (
    token: string,
    spender: string,
    nonce: BigNumberish,
    deadline: BigNumberish,
    allowed: boolean,
    v: BigNumberish,
    r: Buffer,
    s: Buffer
  ): string | undefined =>
    ladle?.interface.encodeFunctionData(LadleActions.Fn.FORWARD_DAI_PERMIT, [
      token,
      spender,
      nonce,
      deadline,
      allowed,
      v,
      r,
      s,
    ]);

  const forwardPermitAction = (
    token: string,
    spender: string,
    amount: BigNumberish,
    deadline: BigNumberish,
    v: BigNumberish,
    r: Buffer,
    s: Buffer
  ): string | undefined =>
    ladle?.interface.encodeFunctionData(LadleActions.Fn.FORWARD_PERMIT, [token, spender, amount, deadline, v, r, s]);

  const batch = async (
    actions: Array<string>,
    overrides?: PayableOverrides
  ): Promise<ContractTransaction | undefined> => ladle?.batch(actions, overrides);

  const transferAction = (token: string, receiver: string, wad: BigNumberish): string | undefined =>
    ladle?.interface.encodeFunctionData(LadleActions.Fn.TRANSFER, [token, receiver, wad]);

  const routeAction = (target: string, calldata: string): string | undefined =>
    ladle?.interface.encodeFunctionData(LadleActions.Fn.ROUTE, [target, calldata]);

  const sellBaseAction = (poolContract: Pool, receiver: string, min: BigNumberish): string | undefined =>
    ladle?.interface.encodeFunctionData(LadleActions.Fn.ROUTE, [
      poolContract.address,
      poolContract.interface.encodeFunctionData(RoutedActions.Fn.SELL_BASE, [receiver, min]),
    ]);

  const sellFYTokenAction = (poolContract: Pool, receiver: string, min: BigNumberish): string | undefined =>
    ladle?.interface.encodeFunctionData(LadleActions.Fn.ROUTE, [
      poolContract.address,
      poolContract.interface.encodeFunctionData(RoutedActions.Fn.SELL_FYTOKEN, [receiver, min]),
    ]);

  const mintWithBaseAction = (
    poolContract: Pool,
    to: string,
    remainder: string,
    fyTokenToBuy: BigNumberish,
    minRatio: BigNumberish,
    maxRatio: BigNumberish
  ): string | undefined =>
    ladle?.interface.encodeFunctionData(LadleActions.Fn.ROUTE, [
      poolContract.address,
      poolContract.interface.encodeFunctionData(RoutedActions.Fn.MINT_WITH_BASE, [
        to,
        remainder,
        fyTokenToBuy,
        minRatio,
        maxRatio,
      ]),
    ]);

  const mintAction = (
    poolContract: Pool,
    to: string,
    remainder: string,
    minRatio: BigNumberish,
    maxRatio: BigNumberish
  ): string | undefined =>
    ladle?.interface.encodeFunctionData(LadleActions.Fn.ROUTE, [
      poolContract.address,
      poolContract.interface.encodeFunctionData(RoutedActions.Fn.MINT_POOL_TOKENS, [to, remainder, minRatio, maxRatio]),
    ]);

  const burnForBaseAction = (
    poolContract: Pool,
    to: string,
    minRatio: BigNumberish,
    maxRatio: BigNumberish
  ): string | undefined =>
    ladle?.interface.encodeFunctionData(LadleActions.Fn.ROUTE, [
      poolContract.address,
      poolContract.interface.encodeFunctionData(RoutedActions.Fn.BURN_FOR_BASE, [to, minRatio, maxRatio]),
    ]);

  const burnAction = (
    poolContract: Pool,
    baseTo: string,
    fyTokenTo: string,
    minRatio: BigNumberish,
    maxRatio: BigNumberish
  ): string | undefined =>
    ladle?.interface.encodeFunctionData(LadleActions.Fn.ROUTE, [
      poolContract.address,
      poolContract.interface.encodeFunctionData(RoutedActions.Fn.BURN_POOL_TOKENS, [
        baseTo,
        fyTokenTo,
        minRatio,
        maxRatio,
      ]),
    ]);

  return {
    forwardDaiPermitAction,
    forwardPermitAction,
    batch,
    transferAction,
    routeAction,
    sellBaseAction,
    sellFYTokenAction,
    mintWithBaseAction,
    mintAction,
    burnForBaseAction,
    burnAction,
    ladleContract: ladle,
  };
};

export default useLadle;
