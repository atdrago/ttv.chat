import { ChatClient } from "@twurple/chat";
import { startTransition, useEffect, useState } from "react";

import { ChatMessages } from "components/ChatMessages";
import { Header } from "components/Header";
import { usePersistentState } from "hooks/usePersistentState";
import { BttvEmote, Message, SevenTvEmote, TwitchUser } from "types";

interface ChatProps {
  bttvChannelEmotes: Record<string, Record<string, BttvEmote>>;
  channels: TwitchUser[];
  sevenTvChannelEmotes: Record<string, Record<string, SevenTvEmote>>;
  chatClient: ChatClient | undefined;
}

export const Chat = ({
  chatClient,
  channels,
  bttvChannelEmotes,
  sevenTvChannelEmotes,
}: ChatProps) => {
  const [messagesByChannel, setMessagesByChannel] = useState<Message[][]>(
    channels.map(() => [])
  );

  const [currentChannel, setCurrentChannel] = usePersistentState(
    "current-channel",
    channels[0]?.login
  );

  useEffect(() => {
    setMessagesByChannel((prevMessagesByChannel) =>
      channels.map((_channel, index) => prevMessagesByChannel[index] ?? [])
    );
  }, [channels]);

  useEffect(() => {
    const messageHandler = chatClient?.onMessage((channel, user, text, msg) => {
      const channelIndex = channels.findIndex(({ login }) => {
        return `#${login}` === channel;
      });

      startTransition(() => {
        const html = msg.parseEmotes().reduce((acc, part) => {
          switch (part.type) {
            case "text": {
              return (
                acc +
                part.text
                  .split(" ")
                  .map((word) => {
                    const { login } = channels[channelIndex];

                    if (word.startsWith("@")) {
                      return `<b>${word}</b>`;
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
                            class="inline"
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
                            class="inline w-8"
                            src="${src}"
                            width="32"
                          />
                        `;
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
                      width="32"
                      class="inline w-8"
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

        setMessagesByChannel((prevMessages) => {
          const result = prevMessages.map(
            (prevChannelMessages, prevChannelIndex) => {
              if (channelIndex === prevChannelIndex) {
                return [
                  ...prevChannelMessages,
                  {
                    id,
                    color,
                    displayName,
                    html,
                    channelUserName: target.value.slice(1),
                  },
                ];
              }

              return prevChannelMessages;
            }
          );

          return result;
        });
      });
    });

    return () => {
      if (chatClient && messageHandler) {
        chatClient.removeListener(messageHandler);
      }
    };
  }, [
    bttvChannelEmotes,
    channels,
    chatClient,
    setMessagesByChannel,
    sevenTvChannelEmotes,
  ]);

  return (
    <div
      className="h-full w-full max-w-full max-h-full grid overflow-hidden bg-slate-800"
      style={{ gridTemplateRows: "min-content minmax(0, 1fr)" }}
    >
      <Header
        joinedChannelUsers={channels}
        currentChannel={currentChannel}
        onCurrentChannelChange={setCurrentChannel}
      />
      {messagesByChannel.map((messages, index) => {
        const { login } = channels[index];

        return (
          <ChatMessages
            isVisible={currentChannel === login}
            messages={messages}
            key={login}
          />
        );
      })}
    </div>
  );
};
