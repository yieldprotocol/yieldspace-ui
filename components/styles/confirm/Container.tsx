import { FC } from 'react';
import tw from 'tailwind-styled-components';

export const Container = tw.div`relative flex justify-center items-center w-full`;
export const Wrap = tw.div`w-full`;

const ConfirmContainer: FC = ({ children }) => (
  <Container>
    <Wrap>{children}</Wrap>
  </Container>
);

export default ConfirmContainer;
