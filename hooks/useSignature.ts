import { useState } from 'react';
import { ethers } from 'ethers';
import { signDaiPermit, signERC2612Permit } from 'eth-permit';

import { useApprovalMethod } from './useApprovalMethod';
import useConnector from './useConnector';
import useTxProcesses from './useTxProcesses';
import { ApprovalType, ICallData, ISignData, ITxProcess } from '../lib/tx/types';
import { MAX_256 } from '../constants';
import { ERC20Permit__factory } from '../contracts/types';
import { DAI_PERMIT_ASSETS, NON_PERMIT_ASSETS } from '../config/assets';
import { LadleActions } from '../lib/tx/operations';
import useLadle from './protocol/useLadle';

/* Get ETH value from JOIN_ETHER OPCode, else zero -> N.B. other values sent in with other OPS are ignored for now */
// const _getCallValue = (calls: ICallData[]): BigNumber => {
//   const joinEtherCall = calls.find((call) => call.operation === LadleActions.Fn.JOIN_ETHER);
//   return joinEtherCall ? BigNumber.from(joinEtherCall?.overrides?.value) : ethers.constants.Zero;
// };

/* Generic hook for chain transactions */
const useSignature = () => {
  const approveMax = false;
  const { account, provider, chainId } = useConnector();
  const { ladleContract } = useLadle();

  const { handleTx, handleSign, addTxProcess } = useTxProcesses();
  const signer = provider?.getSigner(account);
  const approvalMethod = useApprovalMethod();

  const [txProcess, setTxProcess] = useState<ITxProcess | undefined>();

  /**
   * SIGNING
   * 1. Build the signatures of provided by ISignData[], returns ICallData for multicall.
   * 2. Sends off the approval tx, on completion of all txs, returns an empty array.
   * @param { ISignData[] } requestedSignatures
   *
   * @returns { Promise<ICallData[]> }
   */
  const sign = async (requestedSignatures: ISignData[]): Promise<ICallData[]> => {
    const _txProcess = addTxProcess();
    setTxProcess(_txProcess);

    /* Get the spender if not provided, defaults to ladle */
    const getSpender = (spender: string) => {
      if (ethers.utils.isAddress(spender)) {
        return spender;
      }

      return ladleContract.address;
    };

    /* First, filter out any ignored calls */
    const _requestedSigs = requestedSignatures.filter((_rs) => !_rs.ignoreIf);

    const signedList = await Promise.all(
      _requestedSigs.map(async (reqSig) => {
        const _spender = getSpender(reqSig.spender);
        /* set as MAX if approve max is selected */
        const _amount = approveMax ? MAX_256 : reqSig.amount?.toString();
        /* get an ERC20 contract instance. This is only used in the case of fallback tx (when signing is not available) */
        const tokenContract = ERC20Permit__factory.connect(reqSig.target.address, signer!);

        /* Request the signature if using DaiType permit style */
        if (DAI_PERMIT_ASSETS.includes(reqSig.target.symbol)) {
          const { v, r, s, nonce, expiry, allowed } = await handleSign(
            /* We pass over the generated signFn and sigData to the signatureHandler for tracking/tracing/fallback handling */
            () =>
              signDaiPermit(
                provider,
                /* build domain */
                {
                  name: reqSig.target.name,
                  version: reqSig.target.version,
                  chainId: chainId!,
                  verifyingContract: reqSig.target.address,
                },
                account!,
                _spender
              ),
            /* This is the function to call if using fallback approvals */
            () => handleTx(() => tokenContract.approve(_spender, _amount!), _txProcess, true),
            _txProcess,
            approvalMethod
          );

          const args = [
            reqSig.target.address,
            _spender,
            nonce,
            expiry,
            allowed,
            v,
            r,
            s,
          ] as LadleActions.Args.FORWARD_DAI_PERMIT;

          return {
            operation: LadleActions.Fn.FORWARD_DAI_PERMIT,
            args,
            ignoreIf: !(v && r && s), // set ignore flag if signature returned is null (ie. fallbackTx was used)
          };
        }

        /*
          Or else - if not DAI-BASED, request the signature using ERC2612 Permit style
          (handleSignature() wraps the sign function for in app tracking and tracing )
        */

        const { v, r, s, value, deadline } = await handleSign(
          () =>
            signERC2612Permit(
              provider,
              /* build domain */
              reqSig.domain || {
                // uses custom domain if provided, else use created Domain
                name: reqSig.target.name,
                version: reqSig.target.version,
                chainId: chainId!,
                verifyingContract: reqSig.target.address,
              },
              account!,
              _spender,
              _amount
            ),
          /* this is the function for if using fallback approvals */
          () => handleTx(() => tokenContract.approve(_spender, _amount!), _txProcess, true),
          _txProcess,
          NON_PERMIT_ASSETS.includes(reqSig.target.symbol) ? ApprovalType.TX : approvalMethod
        );

        const args = [
          reqSig.target.address, // the asset id OR the pool address (if signing fyToken)
          _spender,
          value,
          deadline,
          v,
          r,
          s,
        ] as LadleActions.Args.FORWARD_PERMIT;

        return {
          operation: LadleActions.Fn.FORWARD_PERMIT,
          args,
          ignoreIf: !(v && r && s), // set ignore flag if signature returned is null (ie. fallbackTx was used)
        };
      })
    );

    /* Returns the processed list of txs required as ICallData[] */
    return signedList.filter((x) => !x.ignoreIf);
  };

  return { sign, signer, txProcess };
};

export default useSignature;
