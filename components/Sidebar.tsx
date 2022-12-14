import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSidebarChannelUsers } from "hooks/useSidebarChannelUsers";
import { useSidebarVisibleContext } from "hooks/useSidebarVisibleContext";

export const Sidebar = () => {
  const { isVisible } = useSidebarVisibleContext();
  const sidebarChannelUsers = useSidebarChannelUsers();
  const pathname = usePathname();
  const currentChannel = pathname?.slice(1) ?? undefined;

  if (!isVisible) {
    return null;
  }

  return (
    <nav
      className="
        bg-neutral-300 dark:bg-neutral-900 z-1 p-2 pt-5
        h-full overflow-auto flex-shrink-0
      "
    >
      <ul className="flex flex-col gap-1 w-9">
        {sidebarChannelUsers?.map(
          ({ display_name, login, profile_image_url }) => (
            <li key={login}>
              <Link
                title={display_name}
                className="cursor-pointer"
                href={`/${login}`}
              >
                {profile_image_url ? (
                  <Image
                    alt={display_name ?? ""}
                    title={display_name ?? ""}
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
              </Link>
            </li>
          )
        )}
      </ul>
    </nav>
  );
};
