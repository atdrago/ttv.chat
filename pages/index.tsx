import { useQuery } from "@tanstack/react-query";
import { getCookie, setCookie } from "cookies-next";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

import { Chat } from "components/Chat";
import { Sidebar } from "components/Sidebar";
import { useChatClient } from "hooks/useChatClient";
import { CookieProvider } from "hooks/useCookieContext";
import { useCurrentUser } from "hooks/useCurrentUser";
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
  appAccessToken?: string | null;
  appAccessTokenErrorMessage?: string;
  userAccessToken?: string | null;
  userAccessTokenErrorMessage?: string | null;
  userRefreshToken?: string | null;
}

export const getServerSideProps: GetServerSideProps<
  HomeProps,
  TwitchAuthQueryParams
> = async ({ query, req, res }) => {
  let appAccessToken: string | null | undefined;

  try {
    const { expiresIn, accessToken } = await getTwitchAppAccessToken();

    if (typeof accessToken !== "string") {
      return {
        props: {
          appAccessTokenErrorMessage:
            "An unknown error occurred attempting to get the app access token.",
        },
      };
    }

    appAccessToken = accessToken;

    setCookie("app-access-token", appAccessToken, {
      req,
      res,
      path: "/",
      maxAge: expiresIn,
    });
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

  const prevUserAccessToken = getCookie("user-access-token", {
    req,
    res,
    path: "/",
  });
  const prevUserRefreshToken = getCookie("user-refresh-token", {
    req,
    res,
    path: "/",
  });

  let userAccessToken =
    typeof prevUserAccessToken === "string" ? prevUserAccessToken : null;
  let userRefreshToken =
    typeof prevUserRefreshToken === "string" ? prevUserRefreshToken : null;
  let userAccessTokenErrorMessage = null;

  try {
    const twitchAuthCode =
      query.code && typeof query.code === "string" ? query.code : null;

    if (twitchAuthCode) {
      const { accessToken, refreshToken } = await getTwitchUserAccessToken(
        twitchAuthCode
      );

      setCookie("user-access-token", accessToken, {
        req,
        res,
        path: "/",
        // Twitch's auth response supplies an `expiresIn` property, but their
        // documentation recommends against its use. Also, the refresh response
        // does not return this property, so we always set the maxAge to 1 year
        // and manage its removal ourselves
        maxAge: 60 * 60 * 24 * 365,
      });
      setCookie("user-refresh-token", refreshToken, {
        req,
        res,
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });

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
  appAccessToken,
  appAccessTokenErrorMessage,
  userAccessToken,
  userRefreshToken,
}: HomeProps) => {
  const router = useRouter();

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

  if (!appAccessToken) {
    return appAccessTokenErrorMessage ? (
      <>{appAccessTokenErrorMessage}</>
    ) : (
      <>no token</>
    );
  }

  let cookies: Record<string, string> = {
    "app-access-token": appAccessToken,
  };

  if (userAccessToken && userRefreshToken) {
    cookies = {
      ...cookies,
      "user-access-token": userAccessToken,
      "user-refresh-token": userRefreshToken,
    };
  }

  return (
    <CookieProvider value={cookies}>
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
    </CookieProvider>
  );
};

export default Home;
