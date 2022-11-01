import { useQuery } from "@tanstack/react-query";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

import { Chat } from "components/Chat";
import { Header } from "components/Header";
import { Sidebar } from "components/Sidebar";
import { useChatClient } from "hooks/useChatClient";
import { useEmotes } from "hooks/useEmotes";
import { usePersistentState } from "hooks/usePersistentState";
import { getTwitchUsers } from "lib/getTwitchUsers";
import { notNullOrUndefined } from "lib/notNullOrUndefined";
import { getTwitchAppAccessToken } from "lib/server/getTwitchAppAccessToken";
import { getTwitchUserAccessToken } from "lib/server/getTwitchUserAccessToken";

interface TwitchAuthQueryParams
  extends Record<string, string | string[] | undefined> {
  code?: string;
  scope?: string;
}

interface HomeProps {
  appAccessTokenErrorMessage?: string;
  appAccessToken?: string;
  userAccessToken?: string | null;
  userAccessTokenErrorMessage?: string | null;
  userRefreshToken?: string | null;
}

export const getServerSideProps: GetServerSideProps<
  HomeProps,
  TwitchAuthQueryParams
> = async ({ query }) => {
  let appAccessToken = null;

  try {
    const { accessToken } = await getTwitchAppAccessToken();

    appAccessToken = accessToken;
  } catch (err) {
    return {
      props: {
        appAccessTokenErrorMessage:
          err instanceof Error
            ? err.message
            : "An unknown error occurred attempting to get the app access token.",
      },
    };
  }

  if (!appAccessToken) {
    return {
      props: {
        appAccessTokenErrorMessage:
          "An unknown error occurred attempting to get the app access token.",
      },
    };
  }

  let userAccessToken = null;
  let userRefreshToken = null;
  let userAccessTokenErrorMessage = null;

  try {
    const twitchAuthCode =
      query.code && typeof query.code === "string" ? query.code : null;

    if (twitchAuthCode) {
      const { accessToken, refreshToken } = await getTwitchUserAccessToken(
        twitchAuthCode
      );

      userAccessToken = accessToken;
      userRefreshToken = refreshToken;
    }
  } catch (err) {
    userAccessTokenErrorMessage =
      err instanceof Error
        ? err.message
        : "An unknown error occurred attempting to get the user access token.";
  }

  return {
    props: {
      appAccessToken,
      userAccessToken,
      userAccessTokenErrorMessage,
      userRefreshToken,
    },
  };
};

const Home: NextPage = ({
  appAccessToken: aat,
  appAccessTokenErrorMessage,
  userAccessToken: uat,
  userRefreshToken: urt,
}: HomeProps) => {
  const router = useRouter();

  useEffect(() => {
    if (router.query["code"]) {
      router.replace("/", undefined, { shallow: true });
    }
  }, [router]);

  const [appAccessToken] = usePersistentState("app-access-token", aat, {
    updateWhenInitialStateChanges: () => !!aat,
  });
  const [userAccessToken] = usePersistentState("user-access-token", uat, {
    updateWhenInitialStateChanges: () => !!uat,
  });
  const [userRefreshToken] = usePersistentState("user-refresh-token", urt, {
    updateWhenInitialStateChanges: () => !!urt,
  });

  const { current } = useRef(["lirik"]);
  const [joinedChannelUserNames, setJoinedChannelUserNames] =
    usePersistentState("joined-channels", current);

  const { data: currentUser } = useQuery(
    ["user"],
    async () => {
      const res = await getTwitchUsers();

      return res.data[0];
    },
    {
      retry: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  const { data: joinedChannelUsers } = useQuery(
    ["user", ...joinedChannelUserNames],
    async () => {
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

  if (!appAccessToken) {
    return appAccessTokenErrorMessage ? (
      <>{appAccessTokenErrorMessage}</>
    ) : (
      <>no token</>
    );
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
      <Sidebar
        appAccessToken={appAccessToken}
        userId={currentUser?.id}
        userAccessToken={userAccessToken}
        userRefreshToken={userRefreshToken}
        onChannelClick={(channelUserName) => {
          setJoinedChannelUserNames((prevJoinedChannelUserNames) =>
            Array.from(
              new Set([...prevJoinedChannelUserNames, channelUserName])
            )
          );
        }}
      />
      <Chat
        chatClient={chatClient}
        bttvChannelEmotes={bttvChannelEmotes}
        channels={channels}
        sevenTvChannelEmotes={sevenTvChannelEmotes}
      />
    </div>
  );
};

export default Home;
