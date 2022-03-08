import tw from 'tailwind-styled-components';
import { ArrowCircleDownIcon, PlusCircleIcon } from '@heroicons/react/solid';

const Container = tw.div`relative flex justify-center items-center w-full`;
const Outer = tw.div`flex items-center justify-end relative w-full`;
const ArrowWrap = tw.div`absolute left-0 right-0 flex items-center justify-center`;

interface IArrow {
  toggleDirection?: () => void;
  isPlusIcon?: boolean;
}

const Arrow = ({ toggleDirection, isPlusIcon }: IArrow) => (
  <Container>
    <Outer>
      <ArrowWrap>
        {isPlusIcon ? (
          <PlusCircleIcon
            className={`justify-self-center text-gray-400 ${
              toggleDirection && `hover:border hover:border-secondary-500 hover:cursor-pointer`
            } rounded-full z-10`}
            height={27}
            width={27}
            onClick={toggleDirection}
          />
        ) : (
          <ArrowCircleDownIcon
            className={`justify-self-center text-gray-400 ${
              toggleDirection && `hover:border hover:border-secondary-500 hover:cursor-pointer`
            } rounded-full z-10`}
            height={27}
            width={27}
            onClick={toggleDirection}
          />
        )}
      </ArrowWrap>
    </Outer>
  </Container>
);

export default Arrow;
