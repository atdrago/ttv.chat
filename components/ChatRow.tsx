import allyColor from "a11ycolor";
import classNames from "classnames";
import { memo, useMemo } from "react";

import { useColorScheme } from "hooks/useColorScheme";
import type { Message } from "types";

interface ChatRowProps {
  message: Message;
}

export const ChatRow = memo(function ChatRowComponent({
  message,
}: ChatRowProps) {
  const { html, color, channelUserName, displayName } = message;
  const colorScheme = useColorScheme();

  const isAtStreamer = useMemo(
    () => new RegExp(`@${channelUserName}`, "i").test(html),
    [channelUserName, html]
  );

  return (
    <li
      className={classNames("px-2 py-1 align-sub break-words", {
        "bg-slate-200": colorScheme === "light" && isAtStreamer,
        "bg-slate-700": colorScheme === "dark" && isAtStreamer,
      })}
    >
      <b
        style={{
          color: color
            ? allyColor(
                color,
                colorScheme === "dark"
                  ? isAtStreamer
                    ? "#334155"
                    : "#1e293b"
                  : isAtStreamer
                  ? "#e2e8f0"
                  : "#f1f5f9"
              )
            : undefined,
        }}
      >
        {displayName}
      </b>
      : <span dangerouslySetInnerHTML={{ __html: html }} />
    </li>
  );
});
