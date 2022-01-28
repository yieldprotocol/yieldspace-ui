import Link from 'next/link';
import { FC } from 'react';
import tw from 'tailwind-styled-components';

const Container = tw.button`w-full my-1.5 hover:bg-gray-900/50 bg-gray-900 rounded-md shadow-md`;
const Inner = tw.div`p-5`;

interface IPoolItem {}

const PoolItem: FC<IPoolItem> = () => {
  const poolId = 1;
  return (
    <Link href={`/${poolId}`}>
      <Container>
        <Inner>
          <div>riToken/Token</div>
        </Inner>
      </Container>
    </Link>
  );
};

export default PoolItem;
