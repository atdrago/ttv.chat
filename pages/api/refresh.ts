import type { NextApiRequest, NextApiResponse } from "next";

type ApiError = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiError>
) {
  if (req.method !== "POST") {
    throw new Error("use post");
  }

  const { userRefreshToken } = req.body;

  if (!userRefreshToken) {
    throw new Error("userRefreshToken is required in request body");
  }

  try {
    const refreshResponse = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: userRefreshToken,
      }),
    });

    const refreshJson = await refreshResponse.json();

    res.status(200).json(refreshJson);
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    } else {
      return res.status(500).json({ message: "Unknown error occurred" });
    }
  }
}
