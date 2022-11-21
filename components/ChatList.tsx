import { ArrowDown } from "phosphor-react";
import { useEffect, useRef, useState } from "react";

import { ChatRow } from "components/ChatRow";
import { useChatClient } from "hooks/useChatClient";
import { isWebUrl } from "lib/isWebUrl";
import type { BttvEmote, Message, SevenTvEmote, TwitchUser } from "types";

interface ChatListProps {
  channelUser?: TwitchUser;
  isPinnedToBottom?: boolean;
  onIsPinnedToBottomChange?: (isPinnedToBottom: boolean) => void;
  bttvChannelEmotes: Record<string, Record<string, BttvEmote>>;
  sevenTvChannelEmotes: Record<string, Record<string, SevenTvEmote>>;
}
const emojiRegexp = /(\p{EPres}|\p{ExtPict})(\u200d(\p{EPres}|\p{ExtPict}))/gu;
const MAX_MESSAGES = 300;
const MESSAGE_BUFFER_SIZE = 200;

export const ChatList = ({
  channelUser,
  bttvChannelEmotes,
  sevenTvChannelEmotes,
}: ChatListProps) => {
  const chatClient = useChatClient(channelUser?.login);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true);

  useEffect(() => {
    setMessages([]);
  }, [channelUser]);

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
          // New messages get prepended to the messages array because messages
          // are displayed using flex-direction: column-reverse;
          return [
            {
              id,
              color,
              displayName,
              html,
              channelUserName: target.value.slice(1),
            },
            ...prevMessages,
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

  const isOverMessageThreshold = messages.length > MAX_MESSAGES;

  useEffect(() => {
    if (isOverMessageThreshold && isPinnedToBottom) {
      setMessages(messages.slice(0, MESSAGE_BUFFER_SIZE));
    }
  }, [isOverMessageThreshold, isPinnedToBottom, messages]);

  return (
    <>
      <ul
        ref={listRef}
        className="text-sm h-full overflow-auto flex flex-col-reverse"
        onScroll={(ev) => {
          if (ev.currentTarget.scrollTop !== 0 && isPinnedToBottom) {
            setIsPinnedToBottom(false);
          } else if (ev.currentTarget.scrollTop === 0 && !isPinnedToBottom) {
            setIsPinnedToBottom(true);
          }
        }}
      >
        {messages.map((message) => (
          <ChatRow key={message.id} message={message} />
        ))}
      </ul>
      <div className="absolute bottom-0 left-0 right-0 py-4 flex justify-center">
        {!isPinnedToBottom ? (
          <button
            className="
              px-4 py-2 rounded-full bg-neutral-900 text-slate-300
              shadow-lg cursor-pointer
              flex gap-2 items-center justify-center
            "
            onClick={() => {
              setIsPinnedToBottom(true);
              listRef.current?.scrollTo(0, 0);
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
