import { useState } from 'react';
import { ContractReceipt, ContractTransaction, ethers } from 'ethers';
import { ApprovalType, ITxProcess, Status } from '../lib/tx/types';
import { v4 as uuid } from 'uuid';

const INIT_STATE: Map<string, ITxProcess> = new Map([]);

const useTxProcess = () => {
  const [txProcesses, setTxProceses] = useState<Map<string, ITxProcess>>(INIT_STATE);

  const addTxProcess = () => {
    const id = uuid();
    setTxProceses((_txProcesses) => ({ ..._txProcesses, [id]: { id } }));
    return id;
  };

  // updates a sepcific tx process based on id, or creates the tx process
  const updateTxProcess = (txProcess: ITxProcess, data?: any) => {
    const tx = txProcesses.get(txProcess.Id);
    setTxProceses((_txProcesses) => ({ ..._txProcesses, [tx?.id!]: { ...tx, ...data } }));
  };

  /* handle case when user or wallet rejects the tx (before submission) */
  const _handleTxRejection = (txProcess: ITxProcess, err: any) => {};

  /* handle an error from a tx that was successfully submitted */
  const _handleTxError = (txProcess: ITxProcess, error: string) => {
    const process = txProcesses?.get(txProcess.id);
    const data = { ...process, tx: { ...process?.tx, status: Status.FAILED, error } };
    updateTxProcess(process!, data);
  };

  const handleTxWillFail = (txProcess: ITxProcess) => {};

  /* Handle a tx */
  const handleTx = async (
    txFn: () => Promise<any>,
    txProcess: ITxProcess,
    _isfallback: boolean = false
  ): Promise<ethers.ContractReceipt | null> => {
    updateTxProcess(txProcess, { tx: { status: Status.PENDING } });

    let tx: ContractTransaction;
    let res: ContractReceipt;

    try {
      /* try the transaction with connected wallet and catch any 'pre-chain'/'pre-tx' errors */
      try {
        tx = await txFn();
      } catch (e) {
        /* this case is when user rejects tx OR wallet rejects tx */
        _handleTxRejection(txProcess, e);
        return null;
      }

      res = await tx.wait();
      const txSuccess = res.status === 1 || false;
      updateTxProcess(txProcess, { status: txSuccess ? Status.SUCCESS : Status.FAILED });

      return res;
    } catch (e) {
      /* catch tx errors */
      _handleTxError(txProcess, 'some error');
      return null;
    }
  };

  /* handle a sig and sig fallbacks */
  /* returns the tx id to be used in handleTx */
  const handleSign = async (
    signFn: () => Promise<any>,
    fallbackFn: () => Promise<any>,
    txProcess: ITxProcess,
    approvalMethod: ApprovalType
  ) => {
    /* start a process */
    updateTxProcess(txProcess, { sig: { status: Status.PENDING } });

    let _sig: any;

    if (approvalMethod === ApprovalType.SIG) {
      _sig = await signFn().catch((err) => {
        console.log(err);
        /* end the process on signature rejection */
        updateTxProcess(txProcess, { sig: { status: Status.REJECTED } });
        return Promise.reject(err);
      });
    } else {
      await fallbackFn().catch((err) => {
        console.log(err);
        /* end the process on signature rejection */
        updateTxProcess(txProcess, { sig: { status: Status.REJECTED } });
        return Promise.reject(err);
      });
      /* on Completion of approval tx, send back an empty signed object (which will be ignored) */
      _sig = {
        v: undefined,
        r: undefined,
        s: undefined,
        value: undefined,
        deadline: undefined,
        nonce: undefined,
        expiry: undefined,
        allowed: undefined,
      };
    }

    updateTxProcess(txProcess, { sig: { status: Status.SUCCESS } });
    return _sig;
  };

  return {
    handleTx,
    handleSign,
    handleTxWillFail,
    updateTxProcess,
    addTxProcess,
    txProcesses,
  };
};

export default useTxProcess;
