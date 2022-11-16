import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { Header } from "components/Header";
import { Sidebar } from "components/Sidebar";

// This empty getServerSideProps function is only necessary so that
// App.getInitialProps runs on the server
export const getServerSideProps: GetServerSideProps = async () => ({
  props: {},
});

const HomePage: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (router.query["code"]) {
      router.replace("/", undefined, { shallow: true });
    }
  }, [router]);

  return (
    <div
      className="
        h-full w-full grid
        text-slate-800 bg-slate-300
        dark:bg-neutral-900 dark:text-slate-300
      "
      style={{
        gridTemplateColumns: "min-content minmax(0, 1fr)",
      }}
    >
      <Sidebar />
      <div
        className="h-full w-full max-w-full max-h-full grid overflow-hidden bg-slate-800"
        style={{ gridTemplateRows: "min-content minmax(0, 1fr)" }}
      >
        <Header />
      </div>
    </div>
  );
};

export default HomePage;
