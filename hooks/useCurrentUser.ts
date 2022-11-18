import { useQuery } from "@tanstack/react-query";

import { useCookies } from "hooks/useCookiesContext";
import { fetchWithAuth } from "lib/client/fetchWithAuth";
import { TwitchUser } from "types";

export const useCurrentUser = () => {
  const { cookies } = useCookies();

  return useQuery(
    // Make the user-access-token a part of the user query key so it refreshes
    // when the token changes
    ["user", cookies["user-access-token"]],
    async () => {
      try {
        const usersResponseJson = await fetchWithAuth<{ data: TwitchUser[] }>(
          "https://api.twitch.tv/helix/users",
          {
            method: "GET",
          },
          "user"
        );

        return usersResponseJson.data[0];
      } catch {
        return null;
      }
    },
    {
      retry: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );
};
