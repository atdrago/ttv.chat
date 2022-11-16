import { useQuery } from "@tanstack/react-query";

import { fetchWithAuth } from "lib/client/fetchWithAuth";
import { TwitchUser } from "types";

export const useTwitchUser = (userName: string | null) => {
  return useQuery(
    ["user", userName],
    async () => {
      if (!userName) {
        return null;
      }

      const usersResponseJson = await fetchWithAuth<{ data: TwitchUser[] }>(
        `https://api.twitch.tv/helix/users?${new URLSearchParams({
          login: userName,
        })}`,
        {
          method: "GET",
        },
        "app"
      );

      return usersResponseJson.data[0];
    },
    {
      enabled: !!userName,
      retry: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );
};
