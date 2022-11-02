import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import Image from "next/image";

import { getTwitchFollowedChannels } from "lib/getTwitchFollowedChannels";
import { getTwitchUsers } from "lib/getTwitchUsers";
import { TwitchChannel } from "types";

interface SidebarProps {
  currentChannel?: string;
  appAccessToken?: string | null | undefined;
  userAccessToken?: string | null | undefined;
  userRefreshToken?: string | null | undefined;
  userId?: string;
  onChannelClick?: (channelUserName: string) => void;
}

export const Sidebar = ({
  currentChannel,
  userId,
  appAccessToken,
  onChannelClick,
}: SidebarProps) => {
  const { data: followedChannels } = useQuery<{ data: TwitchChannel[] }>(
    ["followed"],
    async () => {
      if (!userId) return null;

      return getTwitchFollowedChannels(userId);
    },
    {
      enabled: !!userId,
      retry: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  const followedChannelUserNames =
    followedChannels?.data.map(({ user_name }) => user_name) ?? [];

  const { data: followedChannelUsers } = useQuery(
    ["user", ...followedChannelUserNames],
    async () => {
      const res = await getTwitchUsers({
        userNames: followedChannelUserNames,
      });

      return res.data.sort(
        (a, b) =>
          followedChannelUserNames.indexOf(a.display_name ?? "") -
          followedChannelUserNames.indexOf(b.display_name ?? "")
      );
    },
    {
      enabled: !!appAccessToken && followedChannelUserNames.length > 0,
      retry: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  return (
    <nav
      className={classNames("bg-neutral-900", {
        "z-1 p-2 pt-5 sm:p-5 h-full overflow-auto flex-shrink-0 border-r border-neutral-700 shadow-md shadow-neutral-900":
          followedChannelUsers && followedChannelUsers.length > 0,
      })}
    >
      {followedChannelUsers && followedChannelUsers.length > 0 ? (
        <ul className="flex flex-col gap-1 w-9">
          {followedChannelUsers?.map(({ login, profile_image_url }) => (
            <li key={login}>
              <button
                className="cursor-pointer"
                onClick={() => {
                  if (onChannelClick) {
                    onChannelClick(login);
                  }
                }}
              >
                {profile_image_url ? (
                  <Image
                    alt=""
                    className={classNames(
                      "block h-9 w-9 text-lg leading-6 rounded-full p-0.5 border-2 border-solid",
                      {
                        "border-transparent": currentChannel !== login,
                        "border-emerald-500": currentChannel === login,
                      }
                    )}
                    height={36}
                    src={profile_image_url}
                    width={36}
                  />
                ) : null}
              </button>
              {/* <span className="text-lg leading-6">{login}</span> */}
            </li>
          ))}
        </ul>
      ) : null}
    </nav>
  );
};
