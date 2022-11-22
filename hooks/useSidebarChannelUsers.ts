import { useQuery } from "@tanstack/react-query";

import { useCurrentUser } from "hooks/useCurrentUser";
import { fetchWithAuth } from "lib/client/fetchWithAuth";
import { getTwitchFollowedChannels } from "lib/client/getTwitchFollowedChannels";
import { getTwitchUsers } from "lib/client/getTwitchUsers";

export const useSidebarChannelUsers = () => {
  // 1. Get the current user
  const { data: currentUser } = useCurrentUser();

  // 2. If the user is logged in, get their followed channels
  const { data: followedChannelsUserNames = [] } = useQuery(
    ["followed", currentUser?.id],
    async () => {
      if (!currentUser?.id) return [];

      const followedChannels = await getTwitchFollowedChannels(currentUser.id);

      return followedChannels?.data.map(({ user_name }) => user_name) ?? [];
    },
    {
      enabled: !!currentUser?.id,
      refetchInterval: 5 * 60000, // every 5 minutes
    }
  );

  // 3. If the user is not logged in, get the top channels
  const { data: topChannelsUserNames = [] } = useQuery(
    ["top-channels"],
    async () => {
      const res = await fetchWithAuth(
        "https://api.twitch.tv/helix/streams",
        {
          method: "GET",
        },
        "app"
      );

      return (
        res?.data.map(({ user_login }: { user_login: string }) => user_login) ??
        []
      );
    },
    {
      enabled: !currentUser?.id,
      refetchInterval: 5 * 60000, // every 5 minutes
    }
  );

  const followedOrTopChannelUserNames =
    followedChannelsUserNames.length > 0
      ? followedChannelsUserNames
      : topChannelsUserNames;

  const { data: followedOrTopChannelUsers = [] } = useQuery(
    ["followed-channel-users", ...followedOrTopChannelUserNames],
    async () => {
      const res = await getTwitchUsers({
        userNames: followedOrTopChannelUserNames,
      });

      return res.data.sort(
        (a, b) =>
          followedOrTopChannelUserNames.indexOf(a.display_name ?? "") -
          followedOrTopChannelUserNames.indexOf(b.display_name ?? "")
      );
    },
    {
      enabled: followedOrTopChannelUserNames.length > 0,
    }
  );

  return followedOrTopChannelUsers;
};
