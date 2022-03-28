import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import tw from 'tailwind-styled-components';
import { IPool } from '../../lib/protocol/types';
import Button from '../common/Button';
import { BorderWrap, Header } from '../styles';
import usePools from '../../hooks/protocol/usePools';
import BackButton from '../common/BackButton';
import useRemoveLiqPreview from '../../hooks/protocol/useRemoveLiqPreview';
import { RemoveLiquidityActions } from '../../lib/protocol/liquidity/types';
import USDCMark from '../common/Logos/USDCMark';
import { cleanValue, hexToRgb } from '../../utils/appUtils';
import DaiMark from '../common/Logos/DaiMark';
import ETHMark from '../common/Logos/ETHMark';

const Inner = tw.div`m-4 text-center`;
const ButtonWrap = tw.div`flex justify-between gap-10`;
const PoolDataWrap = tw.div`grid my-5 gap-2 flex-nowrap`;
const PoolDataLabel = tw.div`text-lg dark:text-gray-400 text-gray-500`;
const PoolData = tw.div`text-xl font-semibold dark:text-gray-100 text-gray-800`;

// new style
const Wrap = tw.div`mx-auto cursor-pointer min-h-[492px] 
  w-[290px] dark:bg-gray-800 bg-gray-200 rounded-lg my-5 justify-center align-middle items-center border-[2px]
  dark:border-gray-800 border-gray-200
`;
const Top = tw.div`h-[120px] rounded-t-lg animate-pulse ease-out duration-1000`;
const Middle = tw.div`grid gap-3 justify-start px-5 text-left`;
const Text = tw.div`text-md dark:text-gray-400`;
const Data = tw.div`text-lg dark:text-gray-200`;
const Bottom = tw.div``;

export const marks = {
  DAI: { component: <DaiMark key="DAI" />, color: '#F5AC37' },
  ETH: { component: <ETHMark key="ETH" />, color: '#627EEA' },
  USDC: { component: <USDCMark key="USDC" />, color: '#3E73C4' },
};

export const Logo = ({ symbol }: { symbol: string }) => {
  const mark = marks[symbol];
  return (
    <div className="absolute">
      <div className="flex align-middle justify-center items-center h-[56px] w-[56px] dark:bg-gray-800 bg-gray-200 rounded-full border-[2px] dark:border-gray-800 border-gray-200 relative -mt-[28px]">
        <div
          className="rounded-full absolute"
          style={{
            background: `rgba(${hexToRgb(mark.color)}, .12)`,
          }}
        >
          {mark.component}
        </div>
      </div>
    </div>
  );
};

const PoolItem: FC = () => {
  const router = useRouter();
  const { data: pools } = usePools();
  const { address } = router.query;

  const [pool, setPool] = useState<IPool | undefined>();
  const { baseReceived: basePreview } = useRemoveLiqPreview(
    pool!,
    pool?.lpTokenBalance_!,
    RemoveLiquidityActions.BURN_FOR_BASE
  );

  useEffect(() => {
    if (pools) {
      const _pool = pools[address as string];
      _pool && setPool(_pool);
    }
  }, [pools, address]);

  if (!pool) return null;

  return (
    <BorderWrap>
      <Inner>
        <BackButton onClick={() => router.back()} />
        <Wrap>
          <Top
            style={{
              background: pool.alternateColor,
            }}
          ></Top>
          <Middle>
            <Logo symbol={pool.base.symbol} />
            <div className="mt-10">
              <Header>{pool.displayName}</Header>
              <PoolDataWrap>
                <PoolDataLabel>LP Token Balance:</PoolDataLabel>
                <PoolData>{cleanValue(pool.lpTokenBalance_, pool.base.digitFormat)}</PoolData>
              </PoolDataWrap>
              <PoolDataWrap>
                <PoolDataLabel>LP Token Value:</PoolDataLabel>
                <PoolData>
                  {cleanValue(basePreview, pool.base.digitFormat)} {pool.base.symbol}
                </PoolData>
              </PoolDataWrap>
            </div>
          </Middle>
        </Wrap>
        {/* <PoolDataWrap>
          <PoolDataLabel>LP Token Balance:</PoolDataLabel>
          <PoolData>{cleanValue(pool.lpTokenBalance_, pool.base.digitFormat)}</PoolData>
        </PoolDataWrap>
        <PoolDataWrap>
          <PoolDataLabel>LP Token Value:</PoolDataLabel>
          <PoolData>
            {cleanValue(basePreview, pool.base.digitFormat)} {pool.base.symbol}
          </PoolData>
        </PoolDataWrap> */}
        <ButtonWrap>
          {!pool.isMature && <Button action={() => router.push(`/pool/add/${address}`)}>Add Liquidity</Button>}
          <Button action={() => router.push(`/pool/remove/${address}`)}>Remove</Button>
        </ButtonWrap>
      </Inner>
    </BorderWrap>
  );
};

export default PoolItem;
