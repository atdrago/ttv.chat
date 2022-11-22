import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="bg-neutral-200 dark:bg-neutral-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
