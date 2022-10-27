import { useEffect, useState, useMemo, useRef, startTransition } from "react";
import { useChatClient } from "../hooks/useChatClient";
import { useEmotes } from "../hooks/useEmotes";
import { Message, TwitchUser } from "../types";
import classNames from "classnames";
import { usePersistentState } from "../hooks/usePersistentState";
import { Plus } from "phosphor-react";
import { ChatMessages } from "../components/ChatMessages";

interface ChatProps {
  accessToken: string;
  channels: TwitchUser[];
}

export const Chat = ({ channels }: ChatProps) => {
  const { emoteRegexp, bttvMap, sevenTvMap } = useEmotes(channels);
  const [messagesByChannel, setMessagesByChannel] = useState<Message[][]>(
    channels.map(() => [])
  );
  const channelLogins = useMemo(
    () => channels.map(({ login }) => login),
    [channels]
  );
  const chatClient = useChatClient({
    channels: channelLogins,
  });
  const [currentChannel, setCurrentChannel] = usePersistentState(
    "current-channel",
    channelLogins[0]
  );

  useEffect(() => {
    const messageHandler = chatClient?.onMessage((channel, user, text, msg) => {
      const channelIndex = channels.findIndex(({ login }) => {
        return `#${login}` === channel;
      });

      startTransition(() => {
        const html = msg.parseEmotes().reduce((acc, part, index) => {
          switch (part.type) {
            case "text":
              return part.text.replace(emoteRegexp, (match) => {
                const bttvEmote = bttvMap?.[match];

                if (bttvEmote) {
                  const bttvEmoteId = bttvEmote.id;
                  const src =
                    bttvEmote?.images?.["1x"] ??
                    `https://cdn.betterttv.net/emote/${bttvEmoteId}/1x`;

                  return (
                    acc +
                    `
                      <img
                        alt="${match}"
                        title="${match}"
                        class="inline h-8 will-change-transform rotate-0"
                        src="${src}"
                      />
                    `
                  );
                }

                const sevenTvMatch = sevenTvMap?.[match];

                if (sevenTvMatch) {
                  const width = sevenTvMatch.width[0] ?? "";
                  return (
                    acc +
                    `
                      <img
                        alt="${match}"
                        title="${match}"
                        class="inline"
                        src="${sevenTvMatch.urls[0][1]}"
                        width="${width}"
                        height="32"
                      />
                    `
                  );
                }

                return "";
              });

            case "emote":
              return (
                acc +
                `
                  <img
                    class="inline h-8 will-change-transform rotate-0"
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
            default:
              return acc;
          }
        }, "");
        const { id } = msg;
        const { color, displayName } = msg.userInfo;

        setMessagesByChannel((prevMessages) => {
          const result = prevMessages.map(
            (prevChannelMessages, prevChannelIndex) => {
              if (channelIndex === prevChannelIndex) {
                return [
                  ...prevChannelMessages,
                  { id, color, displayName, html },
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
    bttvMap,
    channels,
    chatClient,
    emoteRegexp,
    setMessagesByChannel,
    sevenTvMap,
  ]);

  return (
    <div className="h-full w-full flex flex-col">
      <div
        className="
          p-3
          dark:bg-neutral-900 dark:text-slate-300
          border-b border-slate-900
          flex gap-3 items-center
          overflow-x-auto overflow-y-hidden
        "
      >
        <button
          className="
            font-mono text-xl rounded-full h-8 w-8
          bg-slate-800
            flex-shrink-0 flex items-center justify-center
          "
        >
          <Plus size={14} weight="bold" />
        </button>
        {channels.map(({ login, profile_image_url }) => (
          <button
            className={classNames(
              "px-4 py-2 rounded flex flex-shrink-0 gap-3 transition-colors",
              {
                "bg-slate-800": login !== currentChannel,
                "bg-slate-700 shadow-sm shadow-slate-600":
                  login === currentChannel,
              }
            )}
            key={login}
            onClick={() => setCurrentChannel(login)}
          >
            <img
              className="h-6 w-6 text-lg leading-6 rounded-full"
              src={profile_image_url}
              alt=""
              height="24"
              width="24"
            />
            <span className="text-lg leading-6">{login}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-8 flex-grow">
        {messagesByChannel.map((messages, index) => (
          <ChatMessages
            isVisible={currentChannel === channelLogins[index]}
            messages={messages}
            key={channelLogins[index]}
          />
        ))}
      </div>
    </div>
  );
};
