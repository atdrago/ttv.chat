import { useQuery } from "@tanstack/react-query";
import type { GetServerSideProps, NextPage } from "next";

import { Chat } from "../components/Chat";
import { notNullOrUndefined } from "../lib/notNullOrUndefined";
import { TwitchUser } from "../types";

interface TwitchAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: "bearer";
}

export const getServerSideProps: GetServerSideProps<{
  response?: TwitchAuthResponse;
}> = async () => {
  try {
    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      body: JSON.stringify({
        client_id: "dwopi6hit5ke343jdo58nbkg1zbu8h",
        client_secret: "qau0sjufalriwsem5925lsa2u5j3xx",
        grant_type: "client_credentials",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { access_token, expires_in, token_type }: TwitchAuthResponse =
      await await response.json();

    return {
      props: {
        response: { access_token, expires_in, token_type },
      },
    };
  } catch (err) {
    return {
      notFound: true,
    };
  }
};

const Home: NextPage = ({ response }: { response?: TwitchAuthResponse }) => {
  const { access_token, expires_in, token_type } = response ?? {};
  const channelLogins = ["pokelawls", "nmplol", "esfandtv"];

  const { data: channelUsers } = useQuery<{ data: TwitchUser[] }>(
    ["channel", ...channelLogins, access_token],
    async () => {
      const usersUrl = new URL("https://api.twitch.tv/helix/users");

      channelLogins.forEach((login) =>
        usersUrl.searchParams.append("login", login)
      );

      const channelResponse = await fetch(usersUrl.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Client-Id": "dwopi6hit5ke343jdo58nbkg1zbu8h",
        },
      });
      console.log("request channel user");

      return await channelResponse.json();
    },
    {
      retry: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  if (!access_token) {
    return <>no token</>;
  }

  const channels = !channelUsers
    ? channelLogins.map((login) => ({ login }))
    : channelLogins
        .map((login) => {
          return channelUsers.data.find(
            ({ login: channelUserLogin }) => login === channelUserLogin
          );
        })
        .filter(notNullOrUndefined);

  return (
    <div
      className="
        h-full w-full
        text-slate-800 bg-slate-300
        dark:bg-slate-800 dark:text-slate-300
      "
    >
      <Chat accessToken={access_token} channels={channels} />
    </div>
  );
};

export default Home;
