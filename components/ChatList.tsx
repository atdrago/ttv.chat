import { usePathname } from "next/navigation";
import { memo, useEffect, useRef, useState } from "react";
import { CellMeasurerCache, List } from "react-virtualized";
import { useDebounce } from "use-debounce";

import { ChatRow } from "components/ChatRow";
import { useChatClient } from "hooks/useChatClient";
import { useEmotes } from "hooks/useEmotes";
import { isWebUrl } from "lib/isWebUrl";
import type { Message, TwitchUser } from "types";

interface ChatListProps {
  channelUser?: TwitchUser;
  height: number;
  width: number;
  isPinnedToBottom?: boolean;
  onIsPinnedToBottomChange?: (isPinnedToBottom: boolean) => void;
}
const emojiRegexp = /(\p{EPres}|\p{ExtPict})(\u200d(\p{EPres}|\p{ExtPict}))/gu;

// const MAX_MESSAGES = 100;
// const MESSAGE_BUFFER_SIZE = 50;

export const ChatList = memo(function ChatListMemo({
  channelUser,
  width,
  height,
  isPinnedToBottom,
  onIsPinnedToBottomChange = () => null,
}: ChatListProps) {
  const scrollTopRef = useRef(0);
  const scrollHeightRef = useRef(0);
  const [cache] = useState<CellMeasurerCache>(
    () =>
      new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 32,
      })
  );
  const chatClient = useChatClient(channelUser?.login);
  const { bttvChannelEmotes, sevenTvChannelEmotes } = useEmotes(channelUser);
  const [messages, setMessages] = useState<Message[]>([]);
  const pathname = usePathname();
  const [windowWidth, setWindowWidth] = useState(0);
  const [windowWidthDebounced] = useDebounce(windowWidth, 250);

  useEffect(() => {
    setMessages([]);
  }, [channelUser]);

  useEffect(() => {
    cache.clearAll();
    onIsPinnedToBottomChange(true);
  }, [cache, onIsPinnedToBottomChange, pathname, windowWidthDebounced]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // const isOverMessageThreshold = messages.length > MAX_MESSAGES;

  // useEffect(() => {
  //   if (isOverMessageThreshold && isPinnedToBottom) {
  //     setMessages(messages.slice(messages.length - MESSAGE_BUFFER_SIZE));
  //     cache.clearAll();
  //     onIsPinnedToBottomChange(true);
  //   }
  // }, [
  //   cache,
  //   isOverMessageThreshold,
  //   isPinnedToBottom,
  //   messages,
  //   onIsPinnedToBottomChange,
  // ]);

  useEffect(() => {
    const messageHandler = chatClient?.onMessage(
      (_channel, _user, _text, msg) => {
        const html = msg.parseEmotes().reduce((acc, part) => {
          switch (part.type) {
            case "text": {
              return (
                acc +
                part.text
                  .split(" ")
                  .map((word) => {
                    const login = channelUser?.login ?? "";

                    if (word.startsWith("@")) {
                      return `<b>${word}</b>`;
                    }

                    if (emojiRegexp.test(word)) {
                      return `<span class="text-3xl">${word}</span>`;
                    }

                    const sevenTvMatch =
                      sevenTvChannelEmotes?.[login]?.[word] ??
                      sevenTvChannelEmotes?.["global"]?.[word];

                    if (sevenTvMatch) {
                      const emoteWidth = sevenTvMatch.width[0] ?? "";

                      return `
                        <img
                          alt="${word}"
                          title="${word}"
                          class="inline max-h-8"
                          src="${sevenTvMatch.urls[0][1]}"
                          width="${emoteWidth}"
                        />
                      `;
                    }

                    const bttvEmote =
                      bttvChannelEmotes?.[login]?.[word] ??
                      bttvChannelEmotes?.["global"]?.[word];

                    if (bttvEmote) {
                      const bttvEmoteId = bttvEmote.id;
                      const src =
                        bttvEmote?.images?.["1x"] ??
                        `https://cdn.betterttv.net/emote/${bttvEmoteId}/1x`;

                      return `
                        <img
                          alt="${word}"
                          title="${word}"
                          class="inline h-8"
                          src="${src}"
                          height="32"
                        />
                      `;
                    }

                    // Some emotes, like D:, look like valid URLs, so add links last
                    if (isWebUrl(word)) {
                      return `<a class="underline" href="${word}" target="_blank">${word}</a>`;
                    }

                    return word;
                  })
                  .join(" ")
              );
            }
            case "emote": {
              return (
                acc +
                `
                  <img
                    height="32"
                    class="inline h-8"
                    alt="${part.displayInfo.code}"
                    title="${part.displayInfo.code}"
                    src="${part.displayInfo.getUrl({
                      animationSettings: "default",
                      size: "1.0",
                      backgroundType: "dark",
                    })}"
                  />
                `
              );
            }
            default:
              return acc + "???";
          }
        }, "");

        const { id, target } = msg;
        const { color, displayName } = msg.userInfo;

        setMessages((prevMessages) => {
          return [
            ...prevMessages,
            {
              id,
              color,
              displayName,
              html,
              channelUserName: target.value.slice(1),
            },
          ];
        });
      }
    );

    return () => {
      if (chatClient && messageHandler) {
        chatClient.removeListener(messageHandler);
      }
    };
  }, [bttvChannelEmotes, chatClient, channelUser, sevenTvChannelEmotes]);

  return (
    <List
      className="text-sm"
      onScroll={({ clientHeight, scrollHeight, scrollTop }) => {
        if (isPinnedToBottom) {
          const isScrollingUpward = scrollTop < scrollTopRef.current;
          const didHeightChange = scrollHeight !== scrollHeightRef.current;

          if (isScrollingUpward && !didHeightChange) {
            onIsPinnedToBottomChange(false);
          }
        } else {
          const didScrollToBottom =
            scrollTop + clientHeight === scrollHeight || scrollHeight === 0;

          if (didScrollToBottom) {
            onIsPinnedToBottomChange(true);
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
});
