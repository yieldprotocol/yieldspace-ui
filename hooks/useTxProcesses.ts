import { useState } from 'react';
import { ContractReceipt, ContractTransaction } from 'ethers';
import { ApprovalType, ITxProcess, Status } from '../lib/tx/types';
import { v4 as uuid } from 'uuid';

const INIT_STATE: Map<string, ITxProcess> = new Map([]);

const useTxProcess = () => {
  const [txProcesses, setTxProceses] = useState<Map<string, ITxProcess>>(INIT_STATE);

  const addTxProcess = (description?: string | undefined) => {
    const id = uuid();
    const newTxProcess = { id, description };
    setTxProceses(txProcesses.set(id, newTxProcess));
    return newTxProcess;
  };

  // updates a sepcific tx process based on id, or creates the tx process
  const updateTxProcess = (txProcess: ITxProcess, data?: any) => {
    const tx = txProcesses.get(txProcess.id);
    setTxProceses((_txProcesses) => _txProcesses.set(tx?.id!, { ...tx, ...data }));
  };

  /* handle case when user or wallet rejects the tx (before submission) */
  const _handleTxRejection = (txProcess: ITxProcess, error: any) => {
    const _txProcess = txProcesses.get(txProcess.id);
    const data = { ..._txProcess, tx: { ..._txProcess?.tx, status: Status.REJECTED, error } };
    updateTxProcess(_txProcess!, data);
  };

  /* handle an error from a tx that was successfully submitted */
  const _handleTxError = (txProcess: ITxProcess, error: string) => {
    const _txProcess = txProcesses.get(txProcess.id);
    const data = { ..._txProcess, tx: { ..._txProcess?.tx, status: Status.FAILED, error } };
    updateTxProcess(_txProcess!, data);
  };

  const handleTxWillFail = (txProcess: ITxProcess) => {};

  /* Handle a tx */
  const handleTx = async (txFn: () => Promise<any>, _isfallback: boolean = false): Promise<ContractReceipt | null> => {
    console.log('in handle tx');

    let tx: ContractTransaction;
    let res: ContractReceipt;

    try {
      /* try the transaction with connected wallet and catch any 'pre-chain'/'pre-tx' errors */
      try {
        console.log('before tx fn');
        console.log('🦄 ~ file: useTxProcesses.ts ~ line 57 ~ useTxProcess ~ txFn', txFn);
        tx = await txFn();
        console.log('🦄 ~ file: useTxProcesses.ts ~ line 58 ~ useTxProcess ~ tx', tx);
      } catch (e) {
        return null;
      }

      res = await tx.wait();
      const txSuccess = res.status === 1 || false;

      return res;
    } catch (e) {
      /* catch tx errors */
      return null;
    }
  };

  /* handle a sig and sig fallbacks */
  /* returns the tx id to be used in handleTx */
  const handleSign = async (
    signFn: () => Promise<any>,
    fallbackFn: () => Promise<any>,
    approvalMethod: ApprovalType
  ) => {
    /* start a process */
    console.log('in handle sign');

    let _sig: any;

    if (approvalMethod === ApprovalType.SIG) {
      _sig = await signFn().catch((err) => {
        console.log(err);
        /* end the process on signature rejection */
        return Promise.reject(err);
      });
    } else {
      await fallbackFn().catch((err) => {
        console.log(err);
        /* end the process on signature rejection */
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
