import { ParsedMessageTextPart } from "@twurple/common/lib/emotes/ParsedMessagePart";

import { getThirdPartyEmoteHtml } from "lib/client/getThirdPartyEmoteHtml";
import { isWebUrl } from "lib/isWebUrl";
import { BttvEmote, SevenTvEmote, TwitchUser } from "types";

const emojiRegexp = /(\p{EPres}|\p{ExtPict})(\u200d(\p{EPres}|\p{ExtPict}))*/gu;

export const getMessageTextHtml = (
  part: ParsedMessageTextPart,
  sevenTvChannelEmotes: Record<string, Record<string, SevenTvEmote>>,
  bttvChannelEmotes: Record<string, Record<string, BttvEmote>>,
  channelUser?: TwitchUser
): string => {
  return part.text
    .split(" ")
    .map((word) => {
      const login = channelUser?.login ?? "";

      if (word.startsWith("@")) {
        return `<b>${word}</b>`;
      }

      if (emojiRegexp.test(word)) {
        return word.replace(emojiRegexp, `<span class="text-2xl">$1</span>`);
      }

      const emoteHtml = getThirdPartyEmoteHtml(
        word,
        login,
        sevenTvChannelEmotes,
        bttvChannelEmotes
      );

      if (emoteHtml) {
        return emoteHtml;
      }

      // Some emotes, like D:, look like valid URLs, so add links last
      if (isWebUrl(word)) {
        return `
        <a
          class="underline"
          href="${word}"
          target="_blank"
        >
          ${word}
        </a>
      `;
      }

      return word;
    })
    .join(" ");
};
