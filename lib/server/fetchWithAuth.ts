import {
  tryLocalStorageGetItem,
  tryLocalStorageSetItem,
} from "lib/client/localStorage";

/**
 * Fetch, but attempt to refresh the userAccessToken if the response to the
 * initial request has a 401 status.
 *
 * @param userRefreshToken userRefreshToken is optional so that this function can be used
 * interchangeably with fetch. It is required if this function should attempt to
 * refresh the userAccessToken.
 */
export const fetchWithAuth = async (
  input: Parameters<typeof fetch>[0],
  init: Parameters<typeof fetch>[1],
  authType: "user" | "app" = "user",
  attempts = 3,
  attemptsLeft = 3
): Promise<any> => {
  let storage = tryLocalStorageGetItem("ttv");
  let storageJson = storage ? JSON.parse(storage) : {};
  const userAccessToken = storageJson["user-access-token"];
  const userRefreshToken = storageJson["user-refresh-token"];
  const appAccessToken = storageJson["app-access-token"];

  if (attemptsLeft === 0) {
    delete storageJson["user-access-token"];
    delete storageJson["user-refresh-token"];
    tryLocalStorageSetItem("ttv", JSON.stringify(storageJson));
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
    storage = tryLocalStorageGetItem("ttv");
    storageJson = storage ? JSON.parse(storage) : {};
    storageJson["user-access-token"] = refreshResponseJson.access_token;
    storageJson["user-refresh-token"] = refreshResponseJson.refresh_token;
    tryLocalStorageSetItem("ttv", JSON.stringify(storageJson));
  } else {
    throw new Error("Could not refresh user token");
  }

  return await fetchWithAuth(input, init, authType, attempts, attempts - 1);
};
