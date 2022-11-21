import { getCookie } from "cookies-next";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";

import { ChatList } from "components/ChatList";
import { Header } from "components/Header";
import { useEmotes } from "hooks/useEmotes";
import { TwitchUser } from "types";

interface ChannelPageProps {
  channelUser?: TwitchUser;
}

export const getServerSideProps: GetServerSideProps<
  ChannelPageProps,
  { channel: string }
> = async ({ params = {}, req, res }) => {
  const { channel } = params;

  const appAccessToken = getCookie("app-access-token", { req, res, path: "/" });

  if (channel) {
    const usersResponse = await fetch(
      `https://api.twitch.tv/helix/users?${new URLSearchParams({
        login: channel,
      })}`,
      {
        headers: {
          Authorization: `Bearer ${appAccessToken}`,
          "Content-Type": "application/json",
          "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
        },
        method: "GET",
      }
    );

    const usersResponseJson = await usersResponse.json();

    return {
      props: {
        channelUser: usersResponseJson.data[0],
      },
    };
  }

  return {
    props: {},
  };
};

const ChannelPage: NextPage<ChannelPageProps> = ({ channelUser }) => {
  const router = useRouter();
  const { channel } = router.query;
  const isChannelValid = typeof channel === "string";
  // Keep `useEmotes` as high in the chain as possible. It takes around 30ms to
  // complete, so putting it lower in the tree means it reruns every time the
  // child component runs
  const { bttvChannelEmotes, sevenTvChannelEmotes } = useEmotes(channelUser);

  if (!isChannelValid || !channelUser) {
    return null;
  }

  return (
    <div
      className="h-full w-full max-w-full max-h-full grid overflow-hidden bg-slate-100 dark:bg-slate-800"
      style={{ gridTemplateRows: "min-content minmax(0, 1fr)" }}
    >
      <Header currentChannelUser={channelUser} />
      <ChatList
        bttvChannelEmotes={bttvChannelEmotes}
        sevenTvChannelEmotes={sevenTvChannelEmotes}
        channelUser={channelUser}
      />
    </div>
  );
};

export default ChannelPage;
