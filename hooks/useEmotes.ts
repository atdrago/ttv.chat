import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

import { BttvEmote, SevenTvEmote, TwitchUser } from "types";

export const useEmotes = (channel?: TwitchUser | null) => {
  const bttvResults = useQueries({
    queries: [
      {
        queryKey: ["bttv", channel?.id],
        queryFn: async () => {
          const bttvResponse = await fetch(
            `https://api.betterttv.net/3/cached/users/twitch/${channel?.id}`,
            { method: "GET" }
          );

          const data = await bttvResponse.json();

          return {
            login: channel?.login,
            response: [
              ...(data.channelEmotes ?? []),
              ...(data.sharedEmotes ?? []),
            ],
          };
        },
        enabled: !!channel?.id,
        retry: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ["ffz", channel?.id],
        queryFn: async () => {
          const ffzResponse = await fetch(
            `https://api.betterttv.net/3/cached/frankerfacez/users/twitch/${channel?.id}`,
            { method: "GET" }
          );

          return { login: channel?.login, response: await ffzResponse.json() };
        },
        enabled: !!channel?.id,
        retry: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ["bttv"],
        queryFn: async () => {
          const bttvResponse = await fetch(
            `https://api.betterttv.net/3/cached/emotes/global`,
            { method: "GET" }
          );

          return { login: null, response: await bttvResponse.json() };
        },
        retry: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      },
    ],
  });

  const sevenTvResults = useQueries({
    queries: [
      {
        queryKey: ["7tv", channel?.login],
        queryFn: async () => {
          const sevenTvResponse = await fetch(
            `https://api.7tv.app/v2/users/${channel?.login}/emotes`,
            { method: "GET" }
          );

          return {
            login: channel?.login,
            response: await sevenTvResponse.json(),
          };
        },
        enabled: !!channel?.login,
        retry: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ["7tv"],
        queryFn: async () => {
          const sevenTvResponse = await fetch(
            "https://api.7tv.app/v2/emotes/global",
            { method: "GET" }
          );

          return { login: null, response: await sevenTvResponse.json() };
        },
        retry: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      },
    ],
  });

  const bttvChannelEmotes = useMemo(() => {
    const results: Record<string, Record<string, BttvEmote>> = {};

    bttvResults.forEach((res) => {
      if (res.data?.response && Array.isArray(res.data.response)) {
        const key = res.data.login ?? "global";

        if (!results[key]) {
          results[key] = {};
        }

        results[key] = {
          ...results[key],
          ...(res.data.response.reduce(
            (acc: Record<string, BttvEmote>, item: BttvEmote) => {
              return {
                ...acc,
                [item.code]: {
                  ...item,
                },
              };
            },
            {}
          ) ?? {}),
        };
      }
    });

    return results;
  }, [bttvResults]);

  const sevenTvChannelEmotes = useMemo(() => {
    const results: Record<string, Record<string, SevenTvEmote>> = {};

    sevenTvResults.forEach((res) => {
      if (res.data?.response && Array.isArray(res.data?.response)) {
        results[res.data.login ?? "global"] =
          res.data.response.reduce(
            (acc: Record<string, SevenTvEmote>, item: SevenTvEmote) => {
              return {
                ...acc,
                [item.name]: {
                  ...item,
                },
              };
            },
            {}
          ) ?? {};
      }
    });

    return results;
  }, [sevenTvResults]);

  return { bttvChannelEmotes, sevenTvChannelEmotes };
};
