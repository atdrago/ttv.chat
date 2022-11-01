import { TwitchPrivateMessage } from "@twurple/chat/lib/commands/TwitchPrivateMessage";

export interface Message {
  id: string;
  channelUserName: string;
  displayName: string;
  color?: string;
  html: string;
}
