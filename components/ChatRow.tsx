import type { Message } from "../types";
import { CellMeasurer, CellMeasurerCache } from "react-virtualized";
import { useRef, useEffect } from "react";

interface ChatRowProps {
  message: Message;
  index: number;
  parent: React.ReactNode;
  style: React.CSSProperties;
  cache: CellMeasurerCache;
}

export const ChatRow = ({
  cache,
  message,
  index,
  parent,
  style,
}: ChatRowProps) => {
  const { html, color, displayName } = message;

  useEffect(() => {}, []);

  return (
    <CellMeasurer
      cache={cache}
      parent={parent}
      columnIndex={0}
      rowIndex={index}
    >
      {({ measure, registerChild }) => {
        return (
          <p ref={registerChild} style={style} className="pb-2 px-2">
            <b style={{ color: color }}>{displayName}</b>:{" "}
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
};
