import { TwitchPrivateMessage } from "@twurple/chat/lib/commands/TwitchPrivateMessage";

export interface Message {
  id: string;
  displayName: string;
  color?: string;
  html: string;
}
