import { getCookie } from "cookies-next";

import { deleteCookie, setCookie } from "hooks/useCookiesContext";

/**
 * Fetch, but attempt to refresh the userAccessToken if the response to the
 * initial request has a 401 status.
 *
 * @param userRefreshToken userRefreshToken is optional so that this function can be used
 * interchangeably with fetch. It is required if this function should attempt to
 * refresh the userAccessToken.
 */
export const fetchWithAuth = async <TResponse = any>(
  input: Parameters<typeof fetch>[0],
  init: Parameters<typeof fetch>[1],
  authType: "user" | "app" = "user",
  attempts = 3,
  attemptsLeft = 3
): Promise<TResponse> => {
  const userAccessToken = getCookie("user-access-token");
  const userRefreshToken = getCookie("user-refresh-token");
  const appAccessToken = getCookie("app-access-token");

  if (attemptsLeft === 0) {
    deleteCookie("user-access-token");
    deleteCookie("user-refresh-token");
    throw new Error(`Failed to fetch after ${attempts} attempts.`);
  }

  if (authType === "user" && !userAccessToken) {
    throw new Error("Attempted to use user token but user never logged in");
  }

  const response = await fetch(input, {
    headers: {
      Authorization: `Bearer ${
        authType === "user" ? userAccessToken : appAccessToken
      }`,
      "Content-Type": "application/json",
      "Client-Id": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
    },
    ...init,
  });

  const responseJson = await response.json();

  if (responseJson.status !== 401) {
    return responseJson;
  }

  const refreshResponse = await fetch("api/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userRefreshToken,
    }),
  });

  const refreshResponseJson = await refreshResponse.json();

  if (refreshResponseJson.access_token && refreshResponseJson.refresh_token) {
    setCookie("user-access-token", refreshResponseJson.access_token, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    setCookie("user-access-token", refreshResponseJson.refresh_token, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  } else {
    throw new Error("Could not refresh user token");
  }

  return await fetchWithAuth(input, init, authType, attempts, attemptsLeft - 1);
};
