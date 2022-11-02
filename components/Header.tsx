import Image from "next/image";
import { TwitchLogo, User, UserList } from "phosphor-react";

import { usePersistentState } from "hooks/usePersistentState";
import { TwitchUser } from "types";

interface HeaderProps {
  currentChannel: string;
  onCurrentChannelChange: (channelUserName: string) => void;
  joinedChannelUsers: TwitchUser[];
}

export const Header = ({ currentChannel, joinedChannelUsers }: HeaderProps) => {
  const [userAccessToken] = usePersistentState("user-access-token", null);

  const twitchLoginHref = new URL(
    `https://id.twitch.tv/oauth2/authorize?${new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
      redirect_uri: process.env.NEXT_PUBLIC_TWITCH_AUTH_REDIRECT_URI,
      response_type: "code",
      scope: "chat:read chat:edit user:read:follows",
    })}`
  );

  const currentChannelUser = joinedChannelUsers.find(
    ({ login }) => login === currentChannel
  );

  return (
    <div
      className="
        p-3
        dark:bg-neutral-900 dark:text-slate-300
        border-b border-slate-900
        flex gap-3 items-center justify-between
        overflow-x-auto overflow-y-hidden
      "
    >
      {currentChannelUser ? (
        <h1 className="flex gap-3 items-center">
          <UserList size={28} />
          {typeof currentChannelUser.profile_image_url === "string" ? (
            <Image
              alt=""
              className="
                h-10 w-10 text-lg leading-6
                rounded-full border-2 border-solid border-emerald-500
                p-0.5 flex-shrink-0
              "
              height={40}
              src={currentChannelUser.profile_image_url}
              width={40}
              priority={true}
            />
          ) : (
            <User
              size={40}
              className="
                h-10 w-10 text-lg leading-6
                rounded-full border-2 border-solid border-emerald-500
                p-0.5 flex-shrink-0
              "
            />
          )}
          <span className="font-bold text-lg">{currentChannel}</span>
        </h1>
      ) : null}
      {!userAccessToken ? (
        <a
          className="
          text-md rounded bg-violet-600 flex items-center justify-center
          px-2 py-1 gap-2
        "
          href={twitchLoginHref.toString()}
        >
          <TwitchLogo size={18} weight="bold" /> Login
        </a>
      ) : null}
    </div>
  );
};
