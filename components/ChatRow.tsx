import classNames from "classnames";
import { memo } from "react";

import { accessibleColor } from "lib/client/accessibleColor";
import type { Message } from "types";

interface ChatRowProps {
  message: Message;
  highlight: boolean;
  colorScheme: "dark" | "light";
}

export const ChatRow = memo(
  function ChatRowComponent({ colorScheme, highlight, message }: ChatRowProps) {
    const { badgeHtml, html, color, displayName } = message;

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
