import classNames from "classnames";
import { memo } from "react";
import { CellMeasurer, CellMeasurerCache } from "react-virtualized";

import type { Message } from "types";

interface ChatRowProps {
  message: Message;
  index: number;
  parent: React.ReactNode;
  style: React.CSSProperties;
  cache: CellMeasurerCache;
  isScrolling: boolean;
}

export const ChatRow = memo(function ChatRowComponent({
  cache,
  message,
  index,
  parent,
  style,
  isScrolling,
}: ChatRowProps) {
  const { html, color, channelUserName, displayName } = message;
  const colorScheme = useColorScheme();

  const isAtStreamer = new RegExp(`@${channelUserName}`, "i").test(html);

  return (
    <CellMeasurer
      cache={cache}
      parent={parent}
      columnIndex={0}
      rowIndex={index}
    >
      {({ measure, registerChild }) => {
        return (
          <p
            ref={registerChild}
            style={style}
            className={classNames("px-2 py-1 align-sub break-words", {
              "bg-slate-700": isAtStreamer,
            })}
          >
            <b
              style={{
                color: color
                  ? allyColor(
                      color,
                      colorScheme === "dark" ? "#1e293b" : "#f1f5f9"
                    )
                  : undefined,
              }}
            >
              {displayName}
            </b>
            :{" "}
            <span
              dangerouslySetInnerHTML={{ __html: html }}
              onLoadCapture={(event) => {
                if (!isScrolling && event.target instanceof HTMLImageElement) {
                  cache.clear(index, 0);
                  measure();
                }
              }}
            />
          </p>
        );
      }}
    </CellMeasurer>
  );
});
