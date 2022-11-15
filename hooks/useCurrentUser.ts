import { useQuery } from "@tanstack/react-query";

import { fetchWithAuth } from "lib/client/fetchWithAuth";
import { TwitchUser } from "types";

export const useCurrentUser = () => {
  return useQuery(
    ["user"],
    async () => {
      const usersResponseJson = await fetchWithAuth<{ data: TwitchUser[] }>(
        "https://api.twitch.tv/helix/users",
        {
          method: "GET",
        },
        "user"
      );

      return usersResponseJson.data[0];
    },
    {
      retry: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );
};
