import { ParsedMessageEmotePart } from "@twurple/common/lib/emotes/ParsedMessagePart";

import type { ColorScheme } from "types";

export const getMessageEmoteHtml = (
  part: ParsedMessageEmotePart,
  colorScheme: ColorScheme
): string => {
  return `
    <img
      height="32"
      class="inline h-8"
      alt="${part.displayInfo.code}"
      title="${part.displayInfo.code}"
      src="${part.displayInfo.getUrl({
        animationSettings: "default",
        size: "3.0",
        backgroundType: colorScheme,
      })}"
      srcset="
        ${part.displayInfo.getUrl({
          animationSettings: "default",
          size: "1.0",
          backgroundType: colorScheme,
        })},
        ${part.displayInfo.getUrl({
          animationSettings: "default",
          size: "2.0",
          backgroundType: colorScheme,
        })} 2x,
        ${part.displayInfo.getUrl({
          animationSettings: "default",
          size: "3.0",
          backgroundType: colorScheme,
        })} 3x
      "
    />
  `;
};
