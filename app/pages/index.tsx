import Head from 'next/head';
import tw from 'tailwind-styled-components';
import Navigation from '../components/Navigation';

const Container = tw.div`h-full w-full text-center antialiased text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900`;

const Index = () => {
  return (
    <>
      <Head>
        <title>Yield Reimbursement Tokens</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container>
        <Navigation />
      </Container>
    </>
  );
};

export default Index;
