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
            "bg-slate-200": colorScheme === "light" && highlight,
            "bg-slate-700": colorScheme === "dark" && highlight,
          }
        )}
      >
        <span
          className="inline-flex gap-1 pr-1 align-sub"
          dangerouslySetInnerHTML={{ __html: badgeHtml }}
        />
        <b
          style={{
            color: color
              ? allyColor(
                  color,
                  colorScheme === "dark"
                    ? highlight
                      ? "#334155"
                      : "#1e293b"
                    : highlight
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
  },
  (prevProps, nextProps) => {
    return (
      prevProps.highlight === nextProps.highlight &&
      prevProps.message === nextProps.message
    );
  }
);
