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

export interface SevenTvEmote {
  height: number[];
  id: string;
  mime: string;
  name: string;
  owner: null;
  status: number;
  tags: null;
  urls: [string, string];
  visibility_simple: unknown[];
  visibility: number;
  width: number[];
}
