interface TwitchClientCredentialsResponse {
  access_token: string;
  expires_in: number;
  token_type: "bearer";
}

export const getTwitchAppAccessToken = async () => {
  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: JSON.stringify({
      client_id: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const {
    access_token,
    expires_in,
    token_type,
  }: TwitchClientCredentialsResponse = await response.json();

  return {
    accessToken: access_token,
    expiresIn: expires_in,
    tokenType: token_type,
  };
};
