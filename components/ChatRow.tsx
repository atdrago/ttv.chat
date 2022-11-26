import classNames from "classnames";
import { memo } from "react";

import { accessibleColor } from "lib/client/accessibleColor";
import type { Message } from "types";

interface ChatRowProps {
  message: Message;
  highlight: boolean;
  colorScheme: "dark" | "light";
}

const formatTime = new Intl.DateTimeFormat("en-US", {
  timeStyle: "short",
  hour12: false,
}).format;

export const ChatRow = memo(
  function ChatRowComponent({ colorScheme, highlight, message }: ChatRowProps) {
    const { badgeHtml, color, date, displayName, html } = message;

    const backgroundColor =
      colorScheme === "dark"
        ? highlight
          ? "#404040"
          : "#262626"
        : highlight
        ? "#e5e5e5"
        : "#f5f5f5";

    const displayNameColor = color
      ? accessibleColor(color, backgroundColor)
      : undefined;

    return (
      <li
        className={classNames(
          "px-2 py-1 align-sub break-words content-visibility-auto",
          {
            "bg-neutral-200": colorScheme === "light" && highlight,
            "bg-neutral-700": colorScheme === "dark" && highlight,
          }
        )}
      >
        <span className="pr-1 text-xs text-neutral-600 dark:text-neutral-400">
          {formatTime(date)}
        </span>
        {badgeHtml ? (
          <span
            className="inline-flex gap-1 pr-1 align-sub"
            dangerouslySetInnerHTML={{ __html: badgeHtml }}
          />
        ) : null}
        <b
          style={{
            color: displayNameColor,
          }}
        >
          {displayName}
        </b>
        : <span dangerouslySetInnerHTML={{ __html: html }} />
      </li>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.colorScheme === nextProps.colorScheme &&
      prevProps.highlight === nextProps.highlight &&
      prevProps.message === nextProps.message
    );
  }
);
