import { ChatClient } from "@twurple/chat";
import { useState, useEffect, useRef } from "react";

interface UseChatClientProps {
  channels: string[];
}

export const useChatClient = ({ channels }: UseChatClientProps) => {
  const [chatClient, setChatClient] = useState<ChatClient>();

  useEffect(() => {
    setChatClient(() => {
      const nextChatClient = new ChatClient({
        channels,
      });

      nextChatClient.connect();

      return nextChatClient;
    });
  }, [channels]);

  return chatClient;
};
