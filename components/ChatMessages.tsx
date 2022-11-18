import { usePathname } from "next/navigation";
import { ArrowDown } from "phosphor-react";
import { useEffect, useRef, useState } from "react";
import { AutoSizer, CellMeasurerCache, List } from "react-virtualized";
import { useDebounce } from "use-debounce";

import { ChatRow } from "components/ChatRow";
import { Message } from "types";

interface ChatMessagesProps {
  messages: Message[];
}

export const ChatMessages = ({ messages }: ChatMessagesProps) => {
  const listRef = useRef();
  const scrollTopRef = useRef(0);
  const scrollHeightRef = useRef(0);
  const [cache] = useState<CellMeasurerCache>(
    () =>
      new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 28,
      })
  );
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true);
  const pathname = usePathname();
  const [windowWidth, setWindowWidth] = useState(0);
  const [windowWidthDebounced] = useDebounce(windowWidth, 250);

  useEffect(() => {
    cache.clearAll();
    setIsPinnedToBottom(true);
  }, [cache, pathname, windowWidthDebounced]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <AutoSizer>
        {({ width, height }) => {
          return (
            <List
              className="text-sm"
              ref={listRef}
              onScroll={({ clientHeight, scrollHeight, scrollTop }) => {
                if (isPinnedToBottom) {
                  const isScrollingUpward = scrollTop < scrollTopRef.current;
                  const didHeightChange =
                    scrollHeight !== scrollHeightRef.current;

                  if (isScrollingUpward && !didHeightChange) {
                    setIsPinnedToBottom(false);
                  }
                } else {
                  const didScrollToBottom =
                    scrollTop + clientHeight === scrollHeight ||
                    scrollHeight === 0;

                  if (didScrollToBottom) {
                    setIsPinnedToBottom(true);
                  }
                }

                scrollTopRef.current = scrollTop;
                scrollHeightRef.current = scrollHeight;
              }}
              width={width}
              height={height}
              overscanRowCount={20}
              rowCount={messages.length}
              deferredMeasurementCache={cache}
              rowHeight={cache.rowHeight}
              rowRenderer={({ index, style, parent, isScrolling }) => {
                const message = messages[index];

                return (
                  <ChatRow
                    cache={cache}
                    index={index}
                    key={message.id}
                    message={message}
                    parent={parent}
                    style={style}
                    isScrolling={isScrolling}
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
