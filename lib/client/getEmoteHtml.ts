import { BttvEmote, SevenTvEmote } from "types";
/**
 * Instead of <img />
 * Should be:
 * <>
 *   &ZeroWidthSpace;
 *   <span class="inline-block">
 *     <img class="-ml-100" />
 *   </span>
 * </>
 */
const ZERO_WIDTH: string[] = [
  // "SoSnowy",
  // "IceCold",
  // "SantaHat",
  // "TopHat",
  // "ReinDeer",
  // "CandyCane",
  // "cvMask",
  // "cvHazmat",
];

export const getThirdPartyEmoteHtml = (
  word: string,
  login: string,
  sevenTvChannelEmotes: Record<string, Record<string, SevenTvEmote>>,
  bttvChannelEmotes: Record<string, Record<string, BttvEmote>>
): string | null => {
  const isZeroWidth = ZERO_WIDTH.includes(word);

  let emoteHtml = null;

  const sevenTvMatch =
    sevenTvChannelEmotes?.[login]?.[word] ??
    sevenTvChannelEmotes?.["global"]?.[word];

  const bttvEmote =
    bttvChannelEmotes?.[login]?.[word] ?? bttvChannelEmotes?.["global"]?.[word];

  if (!sevenTvMatch && !bttvEmote) {
    return null;
  }

  if (sevenTvMatch) {
    const emoteWidth = sevenTvMatch.width[0] ?? "";

    const src = sevenTvMatch.urls[sevenTvMatch.urls.length - 1][1];
    const srcSet = sevenTvMatch.urls
      .map(([density, url]) => `${url} ${density}x`)
      .join(", ");

    emoteHtml = `
      <img
        alt="${word}"
        title="${word}"
        class="inline max-h-8${isZeroWidth ? " max-w-none" : ""}"
        src="${src}"
        srcset="${srcSet}"
        width="${emoteWidth}"
      />
    `;
  }

  if (bttvEmote) {
    const bttvEmoteId = bttvEmote.id;

    if (bttvEmote.images) {
      const src =
        bttvEmote.images?.["4x"] ??
        `https://cdn.betterttv.net/emote/${bttvEmoteId}/4x`;
      const srcSet = Object.entries(bttvEmote.images ?? {})
        .map(([density, url]) => `${url} ${density}`)
        .join(", ");

      emoteHtml = `
        <img
          alt="${word}"
          title="${word}"
          class="inline max-h-8${isZeroWidth ? " max-w-none" : ""}"
          src="${src}"
          srcset="${srcSet}"
          height="32"
        />
      `;
    } else {
      emoteHtml = `
        <img
          alt="${word}"
          title="${word}"
          class="inline max-h-8${isZeroWidth ? " max-w-none" : ""}"
          src="${`https://cdn.betterttv.net/emote/${bttvEmoteId}/3x`}"
          srcset="${`
            https://cdn.betterttv.net/emote/${bttvEmoteId}/1x,
            https://cdn.betterttv.net/emote/${bttvEmoteId}/2x 2x,
            https://cdn.betterttv.net/emote/${bttvEmoteId}/3x 3x
          `}"
          height="32"
        />
      `;
    }
  }

  if (isZeroWidth) {
    return `&ZeroWidthSpace;<span class="inline-block w-0" dir="rtl">${emoteHtml}</span>`;
  }

  return emoteHtml;
};
