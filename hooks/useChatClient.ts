import { ChatClient } from "@twurple/chat";
import { useEffect, useState } from "react";

export const useChatClient = (channel?: string | null) => {
  const [chatClient, setChatClient] = useState<ChatClient>();

  useEffect(() => {
    if (!channel) return;

    setChatClient(() => {
      const nextChatClient = new ChatClient({
        channels: [channel],
      });

      nextChatClient.connect();

      return nextChatClient;
    });
  }, [channel]);

  return chatClient;
};
