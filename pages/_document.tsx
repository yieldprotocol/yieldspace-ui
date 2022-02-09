import Document, { Html, Head, Main, NextScript } from 'next/document';
import tw from 'tailwind-styled-components';

const Body = tw.body`bg-gray-50 dark:bg-gray-900`;

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
        </Head>
        <Body>
          <Main />
          <NextScript />
          <script src="/scripts/themeScript.js" type="text/javascript" async />
        </Body>
      </Html>
    );
  }
}

export default MyDocument;
