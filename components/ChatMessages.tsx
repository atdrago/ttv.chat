import { ArrowDown } from "phosphor-react";
import { useEffect, useRef, useState } from "react";
import { AutoSizer, CellMeasurerCache, List } from "react-virtualized";

import { ChatRow } from "components/ChatRow";
import { Message } from "types";

interface ChatMessagesProps {
  isVisible: boolean;
  messages: Message[];
}

export const ChatMessages = ({ isVisible, messages }: ChatMessagesProps) => {
  const cacheRef = useRef<CellMeasurerCache>(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 32,
    })
  );
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true);

  // Pin to bottom when this component becomes visible
  useEffect(() => {
    if (isVisible) {
      setIsPinnedToBottom(true);
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div>
      <AutoSizer>
        {({ width, height }) => {
          return (
            <List
              onScroll={({ clientHeight, scrollHeight, scrollTop }) => {
                const didScrollToBottom =
                  scrollTop + clientHeight === scrollHeight;

                if (didScrollToBottom && !isPinnedToBottom) {
                  setIsPinnedToBottom(true);
                } else if (!didScrollToBottom && isPinnedToBottom) {
                  setIsPinnedToBottom(false);
                }
              }}
              width={width}
              height={height}
              overscanRowCount={100}
              rowCount={messages.length}
              deferredMeasurementCache={cacheRef.current}
              rowHeight={cacheRef.current.rowHeight}
              rowRenderer={({ index, style, parent }) => {
                const message = messages[index];

                return (
                  <ChatRow
                    cache={cacheRef.current}
                    index={index}
                    key={message.id}
                    message={message}
                    parent={parent}
                    style={style}
                  />
                );
              }}
              scrollToIndex={isPinnedToBottom ? messages.length - 1 : undefined}
            />
          );
        }}
      </AutoSizer>
      <div className="absolute bottom-0 left-0 right-0 py-4 flex justify-center">
        {!isPinnedToBottom ? (
          <button
            className="
            px-4 py-2 rounded-full bg-neutral-900 text-slate-300
            shadow-lg cursor-pointer
            flex gap-2 items-center justify-center
          "
            onClick={() => setIsPinnedToBottom(true)}
          >
            <ArrowDown size={14} weight="bold" />
            Live Chat
          </button>
        ) : null}
      </div>
    </div>
  );
};
