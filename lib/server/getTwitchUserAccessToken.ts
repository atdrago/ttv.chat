interface TwitchAuthResponse {
  access_token?: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string[];
  token_type: "bearer";
}

/**
 * The `code` parameter comes from the query parameters appended to the
 * authentication redirect URI
 */
export const getTwitchUserAccessToken = async (code: string) => {
  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: JSON.stringify({
      client_id: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: "authorization_code",
      redirect_uri: process.env.NEXT_PUBLIC_TWITCH_AUTH_REDIRECT_URI,
      code,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const {
    access_token,
    refresh_token,
    expires_in,
    scope,
    token_type,
  }: TwitchAuthResponse = await response.json();

  return {
    accessToken: access_token ?? null,
    expiresIn: expires_in,
    refreshToken: refresh_token ?? null,
    scope: scope ?? null,
    tokenType: token_type,
  };
};
