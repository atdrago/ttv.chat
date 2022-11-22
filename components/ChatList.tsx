import { ArrowDown } from "phosphor-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ChatRow } from "components/ChatRow";
import { useChatClient } from "hooks/useChatClient";
import { isWebUrl } from "lib/isWebUrl";
import type {
  BttvEmote,
  Message,
  SevenTvEmote,
  TwitchBadge,
  TwitchUser,
} from "types";

interface ChatListProps {
  badges?: TwitchBadge[];
  channelUser?: TwitchUser;
  isPinnedToBottom?: boolean;
  onIsPinnedToBottomChange?: (isPinnedToBottom: boolean) => void;
  bttvChannelEmotes: Record<string, Record<string, BttvEmote>>;
  sevenTvChannelEmotes: Record<string, Record<string, SevenTvEmote>>;
}
const emojiRegexp = /(\p{EPres}|\p{ExtPict})(\u200d(\p{EPres}|\p{ExtPict}))/gu;
const MAX_MESSAGES = 500;
const MESSAGE_BUFFER_SIZE = 100;

export const ChatList = ({
  badges,
  channelUser,
  bttvChannelEmotes,
  sevenTvChannelEmotes,
}: ChatListProps) => {
  const chatClient = useChatClient(channelUser?.login);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true);

  const listRef = useRef<HTMLUListElement>(null);
  const prevScrollTopRef = useRef(0);
  const prevWheelScrollTopRef = useRef(0);
  const movingDownCountRef = useRef(0);
  const wheelMovingUpCountRef = useRef(0);
  const wheelMovingDownCountRef = useRef(0);

  // Make sure messages get cleared if the channelUser changes and the component
  // doesn't get unmounted
  useEffect(() => setMessages([]), [channelUser]);

  // Handles adding new messages and replacing emote tokens with emote images,
  // changing URLs into links, increasing emoji font size, and making usernames
  // bold
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

        const badgeHtml = Array.from(msg.userInfo.badges.entries())
          .map(([badgeCategory, badgeDetail]) => {
            const badgeSet = badges?.find(
              ({ set_id }) => set_id === badgeCategory
            );

            const badge = badgeSet?.versions.find(
              ({ id }) => id === badgeDetail
            );

            return `
              <img
                title="${badgeCategory}"
                class="inline"
                src="${badge?.image_url_1x}"
                width="18"
                height="18"
              />
            `;
          })
          .join("");

        const { id, target } = msg;
        const { color, displayName } = msg.userInfo;
        const channelUserName = target.value.slice(1);
        const message: Message = {
          badgeHtml,
          channelUserName,
          color,
          displayName,
          html,
          id,
        };

        setMessages((prevMessages) => prevMessages.concat([message]));
      }
    );

    return () => {
      if (chatClient && messageHandler) {
        chatClient.removeListener(messageHandler);
      }
    };
  }, [
    badges,
    bttvChannelEmotes,
    channelUser,
    chatClient,
    sevenTvChannelEmotes,
  ]);

  const isOverMessageThreshold = messages.length > MAX_MESSAGES;

  // Handles removing old messages
  useEffect(() => {
    if (isOverMessageThreshold && isPinnedToBottom) {
      setMessages((prevMessages) =>
        prevMessages.slice(prevMessages.length - MESSAGE_BUFFER_SIZE)
      );
    }
  }, [isOverMessageThreshold, isPinnedToBottom, messages]);

  // Scroll the newest messages into view when:
  // - messages change
  // - the user "pins" the chat
  useEffect(() => {
    if (listRef.current && isPinnedToBottom) {
      listRef.current.scrollTop =
        listRef.current.scrollHeight - listRef.current.clientHeight;
    }
  }, [isPinnedToBottom, messages]);

  // Use scroll event ONLY for setting pinned to TRUE. This prevents the chat
  // from ever erroneously unpinning because of normal chat scrolls.
  const handleScroll = useCallback(() => {
    if (listRef.current) {
      const isMovingDown = listRef.current.scrollTop > prevScrollTopRef.current;
      const isNearBottom =
        listRef.current.scrollTop >=
        listRef.current.scrollHeight - listRef.current.clientHeight - 2;

      if (
        isMovingDown &&
        isNearBottom &&
        !isPinnedToBottom &&
        movingDownCountRef.current > 3 &&
        wheelMovingUpCountRef.current === 0
      ) {
        setIsPinnedToBottom(true);
      }

      if (isMovingDown) {
        movingDownCountRef.current += 1;
      } else {
        movingDownCountRef.current = 0;
      }

      prevScrollTopRef.current = listRef.current.scrollTop;
    }
  }, [isPinnedToBottom]);

  // Use wheel event ONLY for setting pinned to FALSE. This ensures it is a user
  // action that is causing the chat to unpin.
  const handleWheel = useCallback(() => {
    if (listRef.current) {
      const isMovingDown =
        listRef.current.scrollTop > prevWheelScrollTopRef.current;
      const isMovingUp =
        listRef.current.scrollTop < prevWheelScrollTopRef.current;

      if (
        isMovingUp &&
        isPinnedToBottom &&
        wheelMovingUpCountRef.current > 3 &&
        wheelMovingDownCountRef.current === 0 &&
        movingDownCountRef.current === 0
      ) {
        setIsPinnedToBottom(false);
      }

      if (isMovingUp) {
        wheelMovingUpCountRef.current += 1;
      } else {
        wheelMovingUpCountRef.current = 0;
      }

      if (isMovingDown) {
        wheelMovingDownCountRef.current += 1;
      } else {
        wheelMovingDownCountRef.current = 0;
      }

      prevWheelScrollTopRef.current = listRef.current.scrollTop;
    }
  }, [isPinnedToBottom]);

  const isAtStreamerRegExp = new RegExp(`@${channelUser?.login}`, "i");

  return (
    <>
      <ul
        ref={listRef}
        className="
          h-full flex flex-col gap-0.5 text-sm
          overflow-y-scroll overflow-x-hidden
          transform-gpu
        "
        onScroll={handleScroll}
        onWheel={handleWheel}
        // When a mobile user starts touching the scrolling chat, this is an
        // immediate indication that we should "unpin" it from the bottom
        onTouchStartCapture={() => setIsPinnedToBottom(false)}
        onLoadCapture={() => {
          if (listRef.current && isPinnedToBottom) {
            listRef.current.scrollTop =
              listRef.current.scrollHeight - listRef.current.clientHeight;
          }
        }}
      >
        {messages.map((message) => (
          <ChatRow
            highlight={isAtStreamerRegExp.test(message.html)}
            key={message.id}
            message={message}
          />
        ))}
      </ul>
      <div className="absolute bottom-0 left-0 right-0 pb-4 flex justify-center">
        {process.env.NODE_ENV === "development" ? (
          <span
            className="
            px-4 py-2 rounded-full
            bg-neutral-300 text-neutral-900
            dark:bg-neutral-900 dark:text-neutral-300
            shadow-lg cursor-pointer
            flex gap-2 items-center justify-center
          "
          >
            {messages.length}
          </span>
        ) : null}
        {!isPinnedToBottom ? (
          <button
            className="
              px-4 py-2 rounded-full
              bg-neutral-300 text-neutral-900
              dark:bg-neutral-900 dark:text-neutral-300
              shadow-lg cursor-pointer
              flex gap-2 items-center justify-center
            "
            onClick={() => {
              setIsPinnedToBottom(true);
            }}
          >
            <ArrowDown size={14} weight="bold" />
            Live Chat
          </button>
        ) : null}
      </div>
    </>
  );
};
