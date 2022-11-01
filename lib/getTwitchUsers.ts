import { fetchWithAuth } from "lib/server/fetchWithAuth";
import { TwitchUser } from "types";

type GetTwitchUsersOptions = { userNames?: string[] };

export const getTwitchUsers = async (
  options: GetTwitchUsersOptions = {}
): Promise<{ data: TwitchUser[] }> => {
  const { userNames } = options;

  const usersUrl = new URL("https://api.twitch.tv/helix/users");

  userNames?.forEach((login) => {
    if (login) usersUrl.searchParams.append("login", login);
  });

  const usersResponseJson = await fetchWithAuth(
    usersUrl.toString(),
    {
      method: "GET",
    },
    userNames && userNames.length > 0 ? "app" : "user"
  );

  return usersResponseJson;
};
