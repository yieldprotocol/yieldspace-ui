import { FC } from 'react';
import { IPool } from '../../lib/protocol/types';
import YieldMark from './YieldMark';

interface IFyTokenLogo {
  pool: IPool | undefined;
}

const FyTokenLogo: FC<IFyTokenLogo> = ({ pool }) => (
  <div className="rounded-full p-[1px] dark:text-gray-50" style={{ background: pool?.color! }}>
    <div className="p-1 bg-gray-50 rounded-full">
      <YieldMark height={14} width={14} colors={[pool?.startColor!, pool?.endColor!]} />
    </div>
  </div>
);

export default FyTokenLogo;
