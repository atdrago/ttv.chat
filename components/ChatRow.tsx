import allyColor from "a11ycolor";
import classNames from "classnames";
import { memo } from "react";

import { useColorScheme } from "hooks/useColorScheme";
import type { Message } from "types";

interface ChatRowProps {
  message: Message;
  highlight: boolean;
}

export const ChatRow = memo(
  function ChatRowComponent({ highlight, message }: ChatRowProps) {
    const { badgeHtml, html, color, displayName } = message;
    const colorScheme = useColorScheme();

    return (
      <li
        className={classNames(
          "px-2 py-1 align-sub break-words transform-gpu content-visibility-auto",
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
            color: color
              ? allyColor(
                  color,
                  colorScheme === "dark"
                    ? highlight
                      ? "#404040"
                      : "#262626"
                    : highlight
                    ? "#e5e5e5"
                    : "#f5f5f5"
                )
              : undefined,
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
      prevProps.highlight === nextProps.highlight &&
      prevProps.message === nextProps.message
    );
  }
);
