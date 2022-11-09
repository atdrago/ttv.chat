import "react-virtualized/styles.css";
import "styles/globals.css";

import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { getCookie, setCookie } from "cookies-next";
import App from "next/app";
import type { AppContext, AppInitialProps, AppProps } from "next/app";
import { useState } from "react";

import { CookieProvider } from "hooks/useCookieContext";
import { getTwitchAppAccessToken } from "lib/server/getTwitchAppAccessToken";
import { getTwitchUserAccessToken } from "lib/server/getTwitchUserAccessToken";

interface PageProps {
  dehydratedState?: unknown;
  appAccessToken?: string | null;
  appAccessTokenErrorMessage?: string;
  userAccessToken?: string | null;
  userAccessTokenErrorMessage?: string | null;
  userRefreshToken?: string | null;
}

const getInitialProps = async (
  appContext: AppContext
): Promise<AppInitialProps<PageProps>> => {
  const appProps = await App.getInitialProps(appContext);
  const { pageProps, ...restAppProps } = appProps;
  const { query, req, res } = appContext.ctx;

  let appAccessToken: string | null | undefined;

  try {
    const { expiresIn, accessToken } = await getTwitchAppAccessToken();

    if (typeof accessToken !== "string") {
      return {
        ...restAppProps,
        pageProps: {
          ...pageProps,
          appAccessTokenErrorMessage:
            "An unknown error occurred attempting to get the app access token.",
        },
      };
    }

    appAccessToken = accessToken;

    setCookie("app-access-token", appAccessToken, {
      req,
      res,
      path: "/",
      maxAge: expiresIn,
    });
  } catch (err) {
    return {
      ...restAppProps,
      pageProps: {
        ...pageProps,
        appAccessTokenErrorMessage:
          err instanceof Error
            ? err.message
            : "An unknown error occurred attempting to get the app access token.",
      },
    };
  }

  const prevUserAccessToken = getCookie("user-access-token", {
    req,
    res,
    path: "/",
  });
  const prevUserRefreshToken = getCookie("user-refresh-token", {
    req,
    res,
    path: "/",
  });

  let userAccessToken =
    typeof prevUserAccessToken === "string" ? prevUserAccessToken : null;
  let userRefreshToken =
    typeof prevUserRefreshToken === "string" ? prevUserRefreshToken : null;
  let userAccessTokenErrorMessage = null;

  try {
    const twitchAuthCode =
      query.code && typeof query.code === "string" ? query.code : null;

    if (twitchAuthCode) {
      const { accessToken, refreshToken } = await getTwitchUserAccessToken(
        twitchAuthCode
      );

      setCookie("user-access-token", accessToken, {
        req,
        res,
        path: "/",
        // Twitch's auth response supplies an `expiresIn` property, but their
        // documentation recommends against its use. Also, the refresh response
        // does not return this property, so we always set the maxAge to 1 year
        // and manage its removal ourselves
        maxAge: 60 * 60 * 24 * 365,
      });
      setCookie("user-refresh-token", refreshToken, {
        req,
        res,
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });

      userAccessToken = accessToken;
      userRefreshToken = refreshToken;
    }
  } catch (err) {
    userAccessTokenErrorMessage =
      err instanceof Error
        ? err.message
        : "An unknown error occurred attempting to get the user access token.";
  }

  return {
    ...restAppProps,
    pageProps: {
      ...pageProps,
      appAccessToken,
      userAccessToken,
      userAccessTokenErrorMessage,
      userRefreshToken,
    },
  };
};

function MyApp({ Component, pageProps }: AppProps<PageProps>) {
  const [queryClient] = useState(() => new QueryClient());

  const {
    appAccessToken,
    userAccessToken,
    userRefreshToken,
    appAccessTokenErrorMessage,
  } = pageProps;

  if (!appAccessToken) {
    return appAccessTokenErrorMessage ? (
      <>{appAccessTokenErrorMessage}</>
    ) : (
      <>no token</>
    );
  }

  let cookies: Record<string, string> = {
    "app-access-token": appAccessToken,
  };

  if (userAccessToken && userRefreshToken) {
    cookies = {
      ...cookies,
      "user-access-token": userAccessToken,
      "user-refresh-token": userRefreshToken,
    };
  }

  return (
    <CookieProvider value={cookies}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <Component {...pageProps} />
        </Hydrate>
      </QueryClientProvider>
    </CookieProvider>
  );
}

MyApp.getInitialProps = getInitialProps;

export default MyApp;
