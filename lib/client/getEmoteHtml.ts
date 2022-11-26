import { BttvEmote, SevenTvEmote, SevenTvEmoteVisibility } from "types";

const BTTV_ZERO_WIDTH: string[] = [
  "SoSnowy",
  "IceCold",
  "SantaHat",
  "TopHat",
  "ReinDeer",
  "CandyCane",
  "cvMask",
  "cvHazmat",
];

export const getThirdPartyEmoteHtml = (
  word: string,
  login: string,
  sevenTvChannelEmotes: Record<string, Record<string, SevenTvEmote>>,
  bttvChannelEmotes: Record<string, Record<string, BttvEmote>>
): string | null => {
  let emoteHtml = null;

  const sevenTvEmote =
    sevenTvChannelEmotes?.[login]?.[word] ??
    sevenTvChannelEmotes?.["global"]?.[word];

  const bttvEmote =
    bttvChannelEmotes?.[login]?.[word] ?? bttvChannelEmotes?.["global"]?.[word];

  if (!sevenTvEmote && !bttvEmote) {
    return null;
  }

  let isZeroWidth = false;

  if (sevenTvEmote) {
    isZeroWidth = sevenTvEmote.visibility === SevenTvEmoteVisibility.ZERO_WIDTH;

    const emoteWidth = sevenTvEmote.width[0] ?? "";

    const src = sevenTvEmote.urls[sevenTvEmote.urls.length - 1][1];
    const srcSet = sevenTvEmote.urls
      .map(([density, url]) => `${url} ${density}x`)
      .join(", ");

    emoteHtml = `
      <img
        alt="${word}"
        title="${word}"
        class="inline h-8 max-h-8${isZeroWidth ? " max-w-none" : ""}"
        src="${src}"
        srcset="${srcSet}"
        width="${emoteWidth}"
      />
    `;
  } else if (bttvEmote) {
    isZeroWidth = BTTV_ZERO_WIDTH.includes(word);

    const bttvEmoteId = bttvEmote.id;

    if (bttvEmote.images) {
      // FrankerFaceZ
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
          class="inline h-8 max-h-8${isZeroWidth ? " max-w-none" : ""}"
          src="${src}"
          srcset="${srcSet}"
          height="32"
        />
      `;
    } else {
      // Better TTV
      emoteHtml = `
        <img
          alt="${word}"
          title="${word}"
          class="inline h-8 max-h-8${isZeroWidth ? " max-w-none" : ""}"
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
