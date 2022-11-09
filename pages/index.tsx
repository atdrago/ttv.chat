import { useQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

import { Chat } from "components/Chat";
import { Sidebar } from "components/Sidebar";
import { useChatClient } from "hooks/useChatClient";
import { useCookies } from "hooks/useCookiesContext";
import { useCurrentUser } from "hooks/useCurrentUser";
import { useEmotes } from "hooks/useEmotes";
import { usePersistentState } from "hooks/usePersistentState";
import { getTwitchUsers } from "lib/getTwitchUsers";
import { notNullOrUndefined } from "lib/notNullOrUndefined";

const Home: NextPage = () => {
  const router = useRouter();
  const { cookies } = useCookies();

  const appAccessToken = cookies["app-access-token"];

  useEffect(() => {
    if (router.query["code"]) {
      router.replace("/", undefined, { shallow: true });
    }
  }, [router]);

  const { current: currentChannels } = useRef(["lirik"]);
  const [joinedChannelUserNames, setJoinedChannelUserNames] =
    usePersistentState("joined-channels", currentChannels);

  const { data: currentUser } = useCurrentUser();

  const { data: joinedChannelUsers } = useQuery(
    ["user", ...joinedChannelUserNames, appAccessToken],
    async () => {
      if (!appAccessToken) {
        return null;
      }

      const res = await getTwitchUsers({
        userNames: joinedChannelUserNames,
      });

      return res.data;
    },
    {
      retry: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  const chatClient = useChatClient({
    channels: joinedChannelUserNames,
  });

  const channels = !joinedChannelUsers
    ? joinedChannelUserNames.map((login) => ({ login }))
    : joinedChannelUserNames
        .map((login) => {
          return joinedChannelUsers?.find(
            ({ login: channelUserLogin }) => login === channelUserLogin
          );
        })
        .filter(notNullOrUndefined);

  const [currentChannel, setCurrentChannel] = usePersistentState(
    "current-channel",
    channels[0]?.login
  );

  const { bttvChannelEmotes, sevenTvChannelEmotes } = useEmotes(channels);

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
      <Sidebar
        currentChannel={currentChannel}
        appAccessToken={
          typeof appAccessToken === "string" ? appAccessToken : null
        }
        userId={currentUser?.id}
        onChannelClick={(channelUserName) => {
          setJoinedChannelUserNames([channelUserName]);
          setCurrentChannel(channelUserName);
        }}
      />
      <Chat
        currentChannel={currentChannel}
        chatClient={chatClient}
        bttvChannelEmotes={bttvChannelEmotes}
        channels={channels}
        sevenTvChannelEmotes={sevenTvChannelEmotes}
        setCurrentChannel={setCurrentChannel}
      />
    </div>
  );
};

export default Home;
