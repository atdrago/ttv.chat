import classNames from "classnames";
import Image from "next/image";
import { TwitchLogo, X } from "phosphor-react";

import { TwitchUser } from "types";

interface HeaderProps {
  currentChannel: string;
  onCurrentChannelChange: (channelUserName: string) => void;
  joinedChannelUsers: TwitchUser[];
}

export const Header = ({
  currentChannel,
  joinedChannelUsers,
  onCurrentChannelChange,
}: HeaderProps) => {
  const twitchLoginHref = new URL(
    `https://id.twitch.tv/oauth2/authorize?${new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
      redirect_uri: process.env.NEXT_PUBLIC_TWITCH_AUTH_REDIRECT_URI,
      response_type: "code",
      scope: "chat:read chat:edit user:read:follows",
    })}`
  );

  return (
    <div
      className="
        p-3
        dark:bg-neutral-900 dark:text-slate-300
        border-b border-slate-900
        flex gap-3 items-center
        overflow-x-auto overflow-y-hidden
      "
    >
      {/* <button
        className="
          font-mono text-xl rounded-full h-8 w-8
        bg-slate-800
          flex-shrink-0 flex items-center justify-center
        "
      >
        <Plus size={14} weight="bold" />
      </button> */}
      <a
        className="
          text-lg rounded-full bg-violet-600 flex items-center justify-center
          px-3 py-1 gap-1
        "
        href={twitchLoginHref.toString()}
      >
        <TwitchLogo size={24} weight="bold" /> Login
      </a>
      {joinedChannelUsers.map(({ login, profile_image_url }) => (
        <span className="flex flex-shrink-0 gap-2" key={login}>
          <button
            className={classNames(
              "px-3 py-2 rounded flex gap-3 transition-colors",
              {
                "bg-slate-800": login !== currentChannel,
                "bg-slate-700 shadow-sm shadow-slate-600":
                  login === currentChannel,
              }
            )}
            onClick={() => onCurrentChannelChange(login)}
          >
            {profile_image_url ? (
              <Image
                alt=""
                className="h-6 w-6 text-lg leading-6 rounded-full"
                height="24"
                src={profile_image_url}
                width="24"
              />
            ) : null}
            <span className="text-lg leading-6">{login}</span>
          </button>
          <button>
            <X />
          </button>
        </span>
      ))}
    </div>
  );
};
