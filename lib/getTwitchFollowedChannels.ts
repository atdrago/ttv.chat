import { fetchWithAuth } from "./server/fetchWithAuth";

export const getTwitchFollowedChannels = async (userId: string) => {
  const followedChannelsUrl = new URL(
    `https://api.twitch.tv/helix/streams/followed?${new URLSearchParams({
      user_id: userId,
    })}`
  );

  const followedResponseJson = await fetchWithAuth(
    followedChannelsUrl.toString(),
    {
      method: "GET",
    }
  );

  return followedResponseJson;
};
