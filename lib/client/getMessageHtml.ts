import type { ParsedMessagePart } from "@twurple/common";

import { getMessageEmoteHtml } from "lib/client/getMessageEmoteHtml";
import { getMessageTextHtml } from "lib/client/getMessageTextHtml";
import { BttvEmote, ColorScheme, SevenTvEmote, TwitchUser } from "types";

export const getMessageHtml = (
  parts: ParsedMessagePart[],
  sevenTvChannelEmotes: Record<string, Record<string, SevenTvEmote>>,
  bttvChannelEmotes: Record<string, Record<string, BttvEmote>>,
  colorScheme: ColorScheme,
  channelUser?: TwitchUser
): string => {
  return parts.reduce((acc, part) => {
    switch (part.type) {
      case "text": {
        return (
          acc +
          getMessageTextHtml(
            part,
            sevenTvChannelEmotes,
            bttvChannelEmotes,
            channelUser
          )
        );
      }
      case "emote": {
        return acc + getMessageEmoteHtml(part, colorScheme);
      }
      default:
        return acc;
    }
  }, "");
};
