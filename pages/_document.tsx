import Document, { Html, Head, Main, NextScript } from 'next/document';
import tw from 'tailwind-styled-components';

const Body = tw.body`h-full w-full antialiased text-zinc-500 dark:text-zinc-400 bg-white dark:bg-gray-900`;

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Body>
          <Head></Head>
          <Main />
          <NextScript />
        </Body>
      </Html>
    );
  }
}

export default MyDocument;