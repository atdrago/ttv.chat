export interface TwitchChannel {
  game_id: string;
  game_name: string;
  id: string;
  is_mature: boolean;
  language: "en";
  started_at: string;
  tag_ids: string[];
  /**
   * @example
   * "https://static-cdn.jtvnw.net/previews-ttv/live_user_cohhcarnage-{width}x{height}.jpg"
   */
  thumbnail_url: string;
  title: string;
  type: "live";
  user_id: string;
  /**
   * @example
   * "cohhcarnage"
   */
  user_login: string;
  /**
   * @example
   * "CohhCarnage"
   */
  user_name: string;
  viewer_count: number;
}
