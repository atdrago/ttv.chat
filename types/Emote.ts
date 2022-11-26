export interface BttvEmote {
  id: string;
  code: string;
  imageType: "png" | "gif";
  /**
   * Only on FrankerFaceZ emotes
   */
  images?: {
    "1x": string;
    "2x": string;
    "4x": string;
  };
  userId: string;
}

/**
 * @see https://github.com/SevenTV/Typings/blob/359948b421eb896c852278d67f33943f9fcbb3a6/typings/DataStructure.ts#L33
 */
export enum SevenTvEmoteVisibility {
  PRIVATE = 1 << 0,
  GLOBAL = 1 << 1,
  HIDDEN = 1 << 2,
  OVERRIDE_BTTV = 1 << 3,
  OVERRIDE_FFZ = 1 << 4,
  OVERRIDE_TWITCH_GLOBAL = 1 << 5,
  OVERRIDE_TWITCH_SUBSCRIBER = 1 << 6,
  ZERO_WIDTH = 1 << 7,
  PERMANENTLY_UNLISTED = 1 << 8,
}

export interface SevenTvEmote {
  height: number[];
  id: string;
  mime: string;
  name: string;
  owner: null;
  status: number;
  tags: null;
  urls: [string, string][];
  visibility_simple: unknown[];
  visibility: SevenTvEmoteVisibility;
  width: number[];
}
