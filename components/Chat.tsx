import { ChatClient } from "@twurple/chat";
import { useEffect, useState } from "react";

import { ChatMessages } from "components/ChatMessages";
import { Header } from "components/Header";
import { isWebUrl } from "lib/isWebUrl";
import { BttvEmote, Message, SevenTvEmote, TwitchUser } from "types";

interface ChatProps {
  bttvChannelEmotes: Record<string, Record<string, BttvEmote>>;
  sevenTvChannelEmotes: Record<string, Record<string, SevenTvEmote>>;
  chatClient: ChatClient | undefined;
  currentChannelUser: TwitchUser;
}

const emojiRegexp = /(\p{EPres}|\p{ExtPict})(\u200d(\p{EPres}|\p{ExtPict}))/gu;

export const Chat = ({
  chatClient,
  bttvChannelEmotes,
  sevenTvChannelEmotes,
  currentChannelUser,
}: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const messageHandler = chatClient?.onMessage((channel, user, text, msg) => {
      const html = msg.parseEmotes().reduce((acc, part) => {
        switch (part.type) {
          case "text": {
            return (
              acc +
              part.text
                .split(" ")
                .map((word) => {
                  const { login } = currentChannelUser;

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
                    const width = sevenTvMatch.width[0] ?? "";

                    return `
                      <img
                        alt="${word}"
                        title="${word}"
                        class="inline max-h-8"
                        src="${sevenTvMatch.urls[0][1]}"
                        width="${width}"
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
    });

    return () => {
      if (chatClient && messageHandler) {
        chatClient.removeListener(messageHandler);
      }
    };
  }, [bttvChannelEmotes, chatClient, currentChannelUser, sevenTvChannelEmotes]);

  return (
    <div
      className="h-full w-full max-w-full max-h-full grid overflow-hidden bg-slate-100 dark:bg-slate-800"
      style={{ gridTemplateRows: "min-content minmax(0, 1fr)" }}
    >
      <Header currentChannelUser={currentChannelUser} />
      <ChatMessages messages={messages} />
    </div>
  );
};
