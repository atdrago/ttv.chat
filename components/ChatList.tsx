import { UserNotice } from "@twurple/chat/lib";
import { ArrowDown } from "phosphor-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ChatRow } from "components/ChatRow";
import { useChatClient } from "hooks/useChatClient";
import { useColorScheme } from "hooks/useColorScheme";
import { getBadgeHtml } from "lib/client/getBadgeHtml";
import { getMessageHtml } from "lib/client/getMessageHtml";
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

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!chatClient) {
        return () => null;
      }

      const handleEmoteOnly = chatClient.onEmoteOnly((_channel, enabled) => {
        // eslint-disable-next-line no-console
        console.log("handleEmoteOnly", { enabled });
      });

      const handleFollowersOnly = chatClient.onFollowersOnly(
        (_channel, enabled, delay) => {
          // eslint-disable-next-line no-console
          console.log("handleFollowersOnly", { enabled, delay });
        }
      );

      return () => {
        chatClient.removeListener(handleEmoteOnly);
        chatClient.removeListener(handleFollowersOnly);
      };
    }, [
      badges,
      bttvChannelEmotes,
      channelUser,
      chatClient,
      colorScheme,
      sevenTvChannelEmotes,
    ]);
  }

  // Handles adding new messages and replacing emote tokens with emote images,
  // changing URLs into links, increasing emoji font size, and making usernames
  // bold
  useEffect(() => {
    if (!chatClient) {
      return () => null;
    }

    const handleChatClear = chatClient.onChatClear(() => {
      setMessages([]);
    });

    const handleMessage = chatClient.onMessage(
      (_channel, _user, _text, twitchPrivateMessage) => {
        const html = getMessageHtml(
          twitchPrivateMessage.parseEmotes(),
          sevenTvChannelEmotes,
          bttvChannelEmotes,
          colorScheme,
          channelUser
        );

        const badgeHtml = getBadgeHtml(
          twitchPrivateMessage.userInfo.badges,
          badges
        );

        const { id } = twitchPrivateMessage;
        const { color, displayName } = twitchPrivateMessage.userInfo;

        const message: Message = {
          badgeHtml,
          color,
          date: twitchPrivateMessage.date,
          displayName,
          html,
          id,
          kind: "normal",
        };

        setMessages((prevMessages) => prevMessages.concat([message]));
      }
    );

    function addUserNotice(userNotice: UserNotice) {
      const html = getMessageHtml(
        userNotice.parseEmotes(),
        sevenTvChannelEmotes,
        bttvChannelEmotes,
        colorScheme,
        channelUser
      );

      const badgeHtml = getBadgeHtml(userNotice.userInfo.badges, badges);

      const { id } = userNotice;
      const { color, displayName } = userNotice.userInfo;

      const message: Message = {
        badgeHtml,
        color,
        date: userNotice.date,
        displayName,
        html,
        id,
        kind: "subscription",
        systemMessage: userNotice.tags.get("system-msg") ?? "",
      };

      setMessages((prevMessages) => prevMessages.concat([message]));
    }

    const handleBitsBadgeUpgrade = chatClient.onBitsBadgeUpgrade(
      (_channel, _user, _upgradeInfo, userNotice) => addUserNotice(userNotice)
    );

    const handleCommunitySub = chatClient.onCommunitySub(
      (_channel, _user, _subInfo, userNotice) => addUserNotice(userNotice)
    );

    const handleResub = chatClient.onResub(
      (_channel, _user, _subInfo, userNotice) => addUserNotice(userNotice)
    );

    const handleSub = chatClient.onSub(
      (_channel, _user, _subInfo, userNotice) => addUserNotice(userNotice)
    );

    const handleGiftPaidUpgrade = chatClient.onGiftPaidUpgrade(
      (_channel, _user, _subInfo, userNotice) => addUserNotice(userNotice)
    );

    const handleSubExtend = chatClient.onSubExtend(
      (_channel, _user, _subInfo, userNotice) => addUserNotice(userNotice)
    );

    const handleSubGift = chatClient.onSubGift(
      (_channel, _user, _subInfo, userNotice) => addUserNotice(userNotice)
    );

    const handlePrimeCommunityGift = chatClient.onPrimeCommunityGift(
      (_channel, _user, _subInfo, userNotice) => addUserNotice(userNotice)
    );

    const handlePrimePaidUpgrade = chatClient.onPrimePaidUpgrade(
      (_channel, _user, _subInfo, userNotice) => addUserNotice(userNotice)
    );

    return () => {
      chatClient.removeListener(handleBitsBadgeUpgrade);
      chatClient.removeListener(handleCommunitySub);
      chatClient.removeListener(handleChatClear);
      chatClient.removeListener(handleMessage);
      chatClient.removeListener(handleResub);
      chatClient.removeListener(handleSub);
      chatClient.removeListener(handleGiftPaidUpgrade);
      chatClient.removeListener(handlePrimeCommunityGift);
      chatClient.removeListener(handlePrimePaidUpgrade);
      chatClient.removeListener(handleSubExtend);
      chatClient.removeListener(handleSubGift);
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
          h-full flex flex-col gap-1
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
