import { BigNumber, ContractReceipt, ethers, PayableOverrides } from 'ethers';
import { signDaiPermit, signERC2612Permit } from 'eth-permit';

import { useApprovalMethod } from './useApprovalMethod';
import useConnector from './useConnector';
import useTxProcesses from './useTxProcesses';
import { ApprovalType, ICallData, ISignData, ITxProcess } from '../lib/tx/types';
import { MAX_256 } from '../constants';
import { ERC20Permit__factory } from '../contracts/types';
import { DAI_PERMIT_ASSETS, NON_PERMIT_ASSETS } from '../config/assets';
import { LadleActions } from '../lib/tx/operations';
import { IPool } from '../lib/protocol/types';

/* Get ETH value from JOIN_ETHER OPCode, else zero -> N.B. other values sent in with other OPS are ignored for now */
const _getCallValue = (_call: ICallData): BigNumber => {
  const joinEtherCall = _call.operation === LadleActions.Fn.JOIN_ETHER ? _call : null;
  return joinEtherCall ? BigNumber.from(joinEtherCall?.overrides?.value) : ethers.constants.Zero;
};

/* Generic hook for chain transactions */
const useTransaction = (pool: IPool, description: string | null) => {
  const approveMax = false;
  const { account, provider, chainId } = useConnector();

  const { handleTx, handleSign, handleTxWillFail, addTxProcess, txProcesses } = useTxProcesses();
  const signer = account ? provider?.getSigner(account) : provider?.getSigner(0);
  const approvalMethod = useApprovalMethod();

  // tx process id
  let id: string;
  let txProcess: ITxProcess | undefined;

  /**
   * TRANSACTING
   * @param { ICallData[] } calls list of callData as ICallData
   *
   * * @returns { Promise<void> }
   */
  const transact = async (_call: ICallData): Promise<ContractReceipt | null | void> => {
    const _contract = pool.contract.connect(signer!);

    /* calculate the value sent */
    const _batchValue = _getCallValue(_call);
    // console.log('Batch value sent:', batchValue.toString());

    /* calculate the gas required */
    let gasEst: BigNumber;
    let gasEstFail: boolean = false;
    try {
      // gasEst = await _contract.estimateGas.batch(encodedCalls, { value: batchValue } as PayableOverrides);
      // console.log('Auto gas estimate:', gasEst.mul(120).div(100).toString());
    } catch (e) {
      console.log('Failed to get gas estimate', e);
      // toast.warning('It appears the transaction will likely fail. Proceed with caution...');
      gasEstFail = true;
    }

    /* handle if the tx if going to fail and transactions aren't forced */
    if (gasEstFail) {
      return handleTxWillFail(txProcess!);
    }

    const func = () => _contract[_call.operation as string]();
    /* Finally, send out the transaction */
    return handleTx(func, txProcess!);
  };

  /**
   * SIGNING
   * 1. Build the signatures of provided by ISignData[], returns ICallData for multicall.
   * 2. Sends off the approval tx, on completion of all txs, returns an empty array.
   * @param { ISignData[] } requestedSignatures
   *
   * @returns { Promise<ICallData[]> }
   */
  const sign = async (requestedSignatures: ISignData[]): Promise<ICallData[]> => {
    id = addTxProcess(description);
    txProcess = txProcesses.get(id);

    /* Get the spender if not provided, defaults to ladle */
    const getSpender = (spender: string) => {
      if (ethers.utils.isAddress(spender)) {
        return spender;
      }
      return spender;
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
            () => handleTx(() => tokenContract.approve(_spender, _amount!), txProcess!, true),
            txProcess!,
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
          () => handleTx(() => tokenContract.approve(_spender, _amount!), txProcess!, true),
          txProcess!,
          NON_PERMIT_ASSETS.includes(reqSig.target.symbol) ? ApprovalType.TX : approvalMethod
        );

        const args = [
          reqSig.target.address, // the asset id OR the seriesId (if signing fyToken)
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

  return { sign, transact };
};

export default useTransaction;
