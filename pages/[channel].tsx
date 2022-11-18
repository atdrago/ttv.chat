import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";

import { Chat } from "components/Chat";
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
    <Chat
      bttvChannelEmotes={bttvChannelEmotes}
      chatClient={chatClient}
      currentChannelUser={channelUser}
      sevenTvChannelEmotes={sevenTvChannelEmotes}
    />
  );
};

export default ChannelPage;
