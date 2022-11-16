import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";

import { Chat } from "components/Chat";
import { Sidebar } from "components/Sidebar";
import { useChatClient } from "hooks/useChatClient";
import { useEmotes } from "hooks/useEmotes";
import { useTwitchUser } from "hooks/useTwitchUser";

// This empty getServerSideProps function is only necessary so that
// App.getInitialProps runs on the server
export const getServerSideProps: GetServerSideProps = async () => ({
  props: {},
});

const ChannelPage: NextPage = () => {
  const router = useRouter();
  const { channel } = router.query;
  const isChannelValid = typeof channel === "string";

  const { data: channelUser } = useTwitchUser(isChannelValid ? channel : null);

  const chatClient = useChatClient(channelUser?.login);
  const { bttvChannelEmotes, sevenTvChannelEmotes } = useEmotes(channelUser);

  if (!isChannelValid || !channelUser) {
    return null;
  }

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
      <Sidebar currentChannel={channel} />
      <Chat
        bttvChannelEmotes={bttvChannelEmotes}
        chatClient={chatClient}
        currentChannelUser={channelUser}
        sevenTvChannelEmotes={sevenTvChannelEmotes}
      />
    </div>
  );
};

export default ChannelPage;
