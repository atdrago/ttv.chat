import { ChatClient } from "@twurple/chat";
import { useEffect, useState } from "react";

interface UseChatClientProps {
  accessToken?: string;
  refreshToken?: string;
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
