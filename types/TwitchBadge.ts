export interface TwitchBadge {
  set_id: string;
  versions: Array<{
    id: string;
    image_url_1x: string;
    image_url_2x: string;
    image_url_4x: string;
  }>;
}
