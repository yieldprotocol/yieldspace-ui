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

  return { forwardPermitAction, batch, transferAction, routeAction, sellBaseAction, ladleContract: ladle };
};

export default useLadle;
