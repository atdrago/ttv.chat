import { getCookie } from "cookies-next";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";

import { ChatList } from "components/ChatList";
import { Header } from "components/Header";
import { useEmotes } from "hooks/useEmotes";
import { TwitchBadge, TwitchUser } from "types";

interface ChannelPageProps {
  badges?: TwitchBadge[];
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

    const usersResponseJson = (await usersResponse.json()) as {
      data: TwitchUser[];
    };

    const channelUser = usersResponseJson.data[0];

    const channelBadgesResponse = await fetch(
      `https://api.twitch.tv/helix/chat/badges?${new URLSearchParams({
        broadcaster_id: channelUser?.id ?? "",
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

    const channelBadgesResponseJson = (await channelBadgesResponse.json()) as {
      data: TwitchBadge[];
    };

    const globalBadgesResponse = await fetch(
      `https://api.twitch.tv/helix/chat/badges/global`,
      {
        headers: {
          Authorization: `Bearer ${appAccessToken}`,
          "Content-Type": "application/json",
          "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
        },
        method: "GET",
      }
    );

    const globalBadgesResponseJson = (await globalBadgesResponse.json()) as {
      data: TwitchBadge[];
    };

    const badges = [
      ...channelBadgesResponseJson.data,
      ...globalBadgesResponseJson.data,
    ];

    return {
      props: { badges, channelUser },
    };
  }

  return {
    props: {},
  };
};

const ChannelPage: NextPage<ChannelPageProps> = ({ badges, channelUser }) => {
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
      className="
        h-full w-full max-w-full max-h-full
        grid overflow-hidden
        bg-neutral-100 dark:bg-neutral-800
        relative
      "
      style={{ gridTemplateRows: "min-content minmax(0, 1fr)" }}
    >
      <Header currentChannelUser={channelUser} />
      <ChatList
        badges={badges}
        bttvChannelEmotes={bttvChannelEmotes}
        channelUser={channelUser}
        sevenTvChannelEmotes={sevenTvChannelEmotes}
      />
    </div>
  );
};

export default ChannelPage;
