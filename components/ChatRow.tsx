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
}

export const ChatRow = memo(function ChatRowComponent({
  cache,
  message,
  index,
  parent,
  style,
}: ChatRowProps) {
  const { html, color, channelUserName, displayName } = message;

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
            className={classNames("p-2 align-sub", {
              "bg-slate-700": isAtStreamer,
            })}
          >
            <b style={{ color }}>{displayName}</b>:{" "}
            <span
              dangerouslySetInnerHTML={{ __html: html }}
              onLoadCapture={(event) => {
                if (event.currentTarget.nodeName === "IMG") {
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
