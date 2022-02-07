import Document, { Html, Head, Main, NextScript } from 'next/document';
import tw from 'tailwind-styled-components';

const Body = tw.body`w-full antialiased text-zinc-500 dark:text-zinc-400 dark:bg-gray-900`;

class MyDocument extends Document {
  render() {
    return (
      <Html className="dark:bg-gray-900">
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
