import { useRouter } from 'next/router';
import tw from 'tailwind-styled-components';
import Button from '../common/Button';

const BorderWrap = tw.div`mx-auto max-w-md p-2 border-2 border-secondary-400 shadow-sm rounded-lg bg-gray-800`;
const Inner = tw.div`align-middle text-left p-5`;
const ButtonWrap = tw.div`flex justify-between gap-10`;
const PoolData = tw.div`h-20 align-middle text-center mt-5`;

const PoolItem = () => {
  const router = useRouter();
  return (
    <BorderWrap>
      <Inner>
        <ButtonWrap>
          <Button action={() => router.push('/pool/add')}>Add Liquidity</Button>
          <Button action={() => router.push('/pool/remove')}>Remove</Button>
        </ButtonWrap>
        <PoolData>some pool data and user balances</PoolData>
      </Inner>
    </BorderWrap>
  );
};

export default PoolItem;
