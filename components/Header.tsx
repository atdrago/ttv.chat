import Image from "next/image";
import { usePathname } from "next/navigation";
import { TwitchLogo, User, UserList } from "phosphor-react";
import { useMemo } from "react";

import { useCookies } from "hooks/useCookiesContext";
import { useSidebarVisibleContext } from "hooks/useSidebarVisibleContext";
import { TwitchUser } from "types";

interface HeaderProps {
  currentChannelUser?: TwitchUser;
}

export const Header = ({ currentChannelUser }: HeaderProps) => {
  const { setIsVisible, isVisible } = useSidebarVisibleContext();
  const { cookies, deleteCookie, setCookie } = useCookies();
  const pathname = usePathname();

  const twitchLoginHref = useMemo(
    () =>
      new URL(
        `https://id.twitch.tv/oauth2/authorize?${new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
          redirect_uri: process.env.NEXT_PUBLIC_TWITCH_AUTH_REDIRECT_URI,
          response_type: "code",
          scope: "chat:read chat:edit user:read:follows",
        })}`
      ).toString(),
    []
  );

  const isLoggedIn = !!cookies["user-access-token"];
  const sidebarToggleLabel = `${isVisible ? "Hide" : "Show"} ${
    isLoggedIn ? "followed" : "top"
  } channels`;

  return (
    <div
      className="
        p-2
        bg-neutral-300 text-neutral-900
        dark:bg-neutral-900 dark:text-neutral-300
        flex gap-3 items-center justify-between
        overflow-x-auto overflow-y-hidden
      "
    >
      <div className="flex gap-3 items-center justify-between">
        <button
          title={sidebarToggleLabel}
          aria-label={sidebarToggleLabel}
          onClick={() => setIsVisible((prevIsVisible) => !prevIsVisible)}
        >
          <UserList size={28} weight={isVisible ? "fill" : "regular"} />
        </button>
        {currentChannelUser ? (
          <h1 className="flex gap-3 items-center">
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
            <span className="font-bold text-lg">
              {currentChannelUser.login}
            </span>
          </h1>
        ) : null}
      </div>
      {!isLoggedIn ? (
        <a
          className="
            text-md rounded bg-violet-600 flex items-center justify-center
            px-2 py-1 gap-2 text-white
          "
          onClick={() => {
            setCookie("auth-redirect-to", pathname, { path: "/", maxAge: 60 });
          }}
          href={twitchLoginHref}
        >
          <TwitchLogo size={18} weight="bold" /> Login
        </a>
      ) : (
        <button
          className="
            text-md rounded bg-violet-600 flex items-center justify-center
            px-2 py-1 gap-2 text-white
          "
          onClick={() => {
            deleteCookie("user-access-token");
            deleteCookie("user-refresh-token");
          }}
        >
          <TwitchLogo size={18} weight="bold" /> Logout
        </button>
      )}
    </div>
  );
};
