import { useEffect, useState, useMemo, useRef } from "react";
import { Message } from "../types";
import { List, AutoSizer, CellMeasurerCache } from "react-virtualized";
import { ArrowDown } from "phosphor-react";
import { ChatRow } from "../components/ChatRow";

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
    <div className="relative flex-grow">
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
              overscanRowCount={10}
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
              // scrollToAlignment="end"
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
