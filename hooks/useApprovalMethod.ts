import { useState } from 'react';
import { ApprovalType } from '../lib/tx/types';

export const useApprovalMethod = (): ApprovalType => {
  const [approvalMethodToUse, setApprovalMethodToUse] = useState<ApprovalType>(ApprovalType.SIG);

  return approvalMethodToUse;
};
