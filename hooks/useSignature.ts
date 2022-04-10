import { ethers } from 'ethers';
import { signDaiPermit, signERC2612Permit } from 'eth-permit';
import { useApprovalMethod } from './useApprovalMethod';
import useTxProcesses from './useTxProcesses';
import { ApprovalType, ILadleAction, ISignData } from '../lib/tx/types';
import { MAX_256 } from '../constants';
import { ERC20Permit__factory } from '../contracts/types';
import { DAI_PERMIT_ASSETS, NON_PERMIT_ASSETS } from '../config/assets';
import { LadleActions } from '../lib/tx/operations';
import useLadle from './protocol/useLadle';
import { useWeb3React } from '@web3-react/core';

const useSignature = () => {
  const { account, provider, chainId } = useWeb3React();
  const { ladleContract: ladle, forwardDaiPermitAction, forwardPermitAction } = useLadle();
  const { handleTx, handleSign } = useTxProcesses();
  const approvalMethod = useApprovalMethod();
  const approveMax = false;

  /**
   * SIGNING
   * 1. Build the signatures of provided by ISignData[], returns ICallData for multicall.
   * 2. Sends off the approval tx, on completion of all txs, returns an empty array.
   * @param { ISignData[] } requestedSignatures
   *
   * @returns { ILadleAction[]> } // encoded string representation of the permit action used by the ladle
   */
  const sign = async (requestedSignatures: ISignData[]): Promise<ILadleAction[]> => {
    /* Get the spender if not provided, defaults to ladle */
    const getSpender = (spender: string) => {
      if (ethers.utils.isAddress(spender)) {
        return spender;
      }

      return ladle?.address;
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
                _spender!
              ),
            /* This is the function to call if using fallback approvals */
            () => handleTx(() => tokenContract.approve(_spender!, _amount!), true),
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
            action: forwardDaiPermitAction(...args)!,
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
              _spender!,
              _amount
            ),
          /* this is the function for if using fallback approvals */
          () => handleTx(() => tokenContract.approve(_spender!, _amount!), true),
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
          action: forwardPermitAction(...args)!,
          ignoreIf: !(v && r && s), // set ignore flag if signature returned is null (ie. fallbackTx was used)
        };
      })
    );

    /* Returns the processed list of txs required as ICallData[] */
    return signedList.filter((x) => !x.ignoreIf);
  };

  return { sign };
};

export default useSignature;
