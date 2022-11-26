import { ArrowDown } from "phosphor-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ChatRow } from "components/ChatRow";
import { useChatClient } from "hooks/useChatClient";
import { useColorScheme } from "hooks/useColorScheme";
import { getMessageEmoteHtml } from "lib/client/getMessageEmoteHtml";
import { getMessageTextHtml } from "lib/client/getMessageTextHtml";
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
  bttvChannelEmotes: Record<string, Record<string, BttvEmote>>;
  sevenTvChannelEmotes: Record<string, Record<string, SevenTvEmote>>;
}
const MAX_MESSAGES = 500;
const MESSAGE_BUFFER_SIZE = 100;

export const ChatList = ({
  badges,
  channelUser,
  bttvChannelEmotes,
  sevenTvChannelEmotes,
}: ChatListProps) => {
  const chatClient = useChatClient(channelUser?.login);
  const colorScheme = useColorScheme();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true);

  const listRef = useRef<HTMLUListElement>(null);
  const prevWheelScrollTopRef = useRef(0);
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
                getMessageTextHtml(
                  part,
                  sevenTvChannelEmotes,
                  bttvChannelEmotes,
                  channelUser
                )
              );
            }
            case "emote": {
              return acc + getMessageEmoteHtml(part, colorScheme);
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

            if (!badge) return "";

            return `
              <img
                title="${badgeCategory}"
                alt="${badgeCategory}"
                class="inline"
                srcset="
                  ${badge.image_url_1x},
                  ${badge.image_url_2x} 2x,
                  ${badge.image_url_4x} 4x
                "
                src="${badge.image_url_4x}"
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
    colorScheme,
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
  }, [isOverMessageThreshold, isPinnedToBottom]);

  // Scroll the newest messages into view when:
  // - messages change
  // - the user "pins" the chat
  useEffect(() => {
    if (listRef.current && isPinnedToBottom) {
      listRef.current.scrollTop =
        listRef.current.scrollHeight - listRef.current.clientHeight;
    }
  }, [isPinnedToBottom, messages]);

  // Use wheel event instead of scroll event to determine when to pin/unpin
  // because it's difficult to determine what is triggering the scroll: the
  // user, or another message being added and scrolled to programmatically. The
  // wheel event is not triggered by changes to scrollTop.
  // Unfortunately this means there's no way to scroll and pin to the bottom on
  // mobile, since they have no wheel event.
  const handleWheel = useCallback(() => {
    if (listRef.current) {
      const isMovingDown =
        listRef.current.scrollTop > prevWheelScrollTopRef.current;
      const isMovingUp =
        listRef.current.scrollTop < prevWheelScrollTopRef.current;
      const isNearBottom =
        listRef.current.scrollTop >=
        listRef.current.scrollHeight - listRef.current.clientHeight - 2;

      if (
        isMovingUp &&
        isPinnedToBottom &&
        wheelMovingDownCountRef.current === 0
      ) {
        setIsPinnedToBottom(false);
      } else if (
        isMovingDown &&
        isNearBottom &&
        !isPinnedToBottom &&
        wheelMovingUpCountRef.current === 0
      ) {
        setIsPinnedToBottom(true);
      }

      if (isMovingUp) {
        wheelMovingUpCountRef.current++;
      } else {
        wheelMovingUpCountRef.current = 0;
      }

      if (isMovingDown) {
        wheelMovingDownCountRef.current++;
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
          h-full flex flex-col gap-1 text-sm
          overflow-y-scroll overflow-x-hidden
        "
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
            colorScheme={colorScheme}
            highlight={isAtStreamerRegExp.test(message.html)}
            key={message.id}
            message={message}
          />
        ))}
      </ul>
      <div
        className="
          absolute bottom-0 left-0 right-0 pb-4 flex justify-center
          pointer-events-none
        "
      >
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
              pointer-events-auto
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
