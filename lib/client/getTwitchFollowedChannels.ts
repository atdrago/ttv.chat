import { fetchWithAuth } from "lib/client/fetchWithAuth";
import { TwitchChannel } from "types";

export const getTwitchFollowedChannels = async (userId: string) => {
  const followedChannelsUrl = new URL(
    `https://api.twitch.tv/helix/streams/followed?${new URLSearchParams({
      user_id: userId,
    })}`
  );

  const followedResponseJson: { data: TwitchChannel[] } = await fetchWithAuth(
    followedChannelsUrl.toString(),
    {
      method: "GET",
    }
  );

  return followedResponseJson;
};
