import type { GetServerSideProps, NextPage } from "next";

import { Header } from "components/Header";

// This empty getServerSideProps function is only necessary so that
// App.getInitialProps runs on the server
export const getServerSideProps: GetServerSideProps = async () => ({
  props: {},
});

const HomePage: NextPage = () => {
  return (
    <div
      className="h-full w-full max-w-full max-h-full grid overflow-hidden bg-slate-800"
      style={{ gridTemplateRows: "min-content minmax(0, 1fr)" }}
    >
      <Header />
    </div>
  );
};

export default HomePage;
