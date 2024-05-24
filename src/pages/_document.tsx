import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        <title>Mine Sweeper</title>
        <meta name="description" content="INIAD.ts | マインスイーパー" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
