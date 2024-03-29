import tw from 'tailwind-styled-components';
import { PlusIcon, ArrowDownIcon } from '@heroicons/react/solid';

type ArrowProps = {
  $hasToggle: boolean;
};

const Container = tw.div`relative flex justify-center items-center w-full`;
const Outer = tw.div`flex items-center justify-end relative w-full`;
const IconWrap = tw.div`absolute left-0 right-0 flex items-center justify-center`;
const IconInner = tw.div<ArrowProps>`${(p) =>
  p.$hasToggle
    ? 'hover:cursor-pointer text-primary-500 dark:hover:border-primary-500/30 hover:border-primary-500/30'
    : ''} rounded-[10px] dark:bg-gray-800 border-2 dark:border-gray-900 bg-gray-100 border-gray-300 p-1 z-10`;

interface IArrow {
  toggleDirection?: () => void;
  isPlusIcon?: boolean;
}

const Arrow = ({ toggleDirection, isPlusIcon }: IArrow) => (
  <Container>
    <Outer>
      <IconWrap>
        <IconInner onClick={toggleDirection} $hasToggle={!!toggleDirection && !isPlusIcon}>
          {isPlusIcon ? (
            <PlusIcon className="justify-self-center text-primary-500" height={18} width={18} />
          ) : (
            <ArrowDownIcon className="justify-self-center text-primary-500" height={18} width={18} />
          )}
        </IconInner>
      </IconWrap>
    </Outer>
  </Container>
);

export default Arrow;
