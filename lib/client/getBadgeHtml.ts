import type { TwitchBadge } from "types";

export const getBadgeHtml = (
  badgesMap: Map<string, string>,
  badges?: TwitchBadge[]
): string => {
  return Array.from(badgesMap.entries())
    .map(([badgeCategory, badgeDetail]) => {
      const badgeSet = badges?.find(({ set_id }) => set_id === badgeCategory);

      const badge = badgeSet?.versions.find(({ id }) => id === badgeDetail);

      if (!badge) return "";

      return `
        <img
          title="${badgeCategory}"
          alt="${badgeCategory}"
          class="inline"
          srcset="
            ${badge.image_url_1x},
            ${badge.image_url_2x} 2x,
            ${badge.image_url_4x} 4x
          "
          src="${badge.image_url_4x}"
          width="18"
          height="18"
        />
      `;
    })
    .join("");
};
