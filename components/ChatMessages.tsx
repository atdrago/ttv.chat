import { ArrowDown } from "phosphor-react";
import { useState } from "react";
import { AutoSizer } from "react-virtualized";

import { ChatList } from "components/ChatList";
import { TwitchUser } from "types";

interface ChatMessagesProps {
  channelUser: TwitchUser;
}

export const ChatMessages = ({ channelUser }: ChatMessagesProps) => {
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true);

  return (
    <div>
      <AutoSizer>
        {({ width, height }) => {
          return (
            <ChatList
              width={width}
              height={height}
              channelUser={channelUser}
              isPinnedToBottom={isPinnedToBottom}
              onIsPinnedToBottomChange={setIsPinnedToBottom}
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
