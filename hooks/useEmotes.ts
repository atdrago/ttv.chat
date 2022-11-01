import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { BttvEmote, SevenTvEmote, TwitchUser } from "types";

export const useEmotes = (channels: TwitchUser[] = []) => {
  const bttvResults = useQueries({
    queries: [
      ...channels.flatMap(({ id, login }) => [
        {
          queryKey: ["bttv", id],
          queryFn: async () => {
            const bttvResponse = await fetch(
              `https://api.betterttv.net/3/cached/users/twitch/${id}`,
              { method: "GET" }
            );

            const data = await bttvResponse.json();

            return {
              login,
              response: [
                ...(data.channelEmotes ?? []),
                ...[data.sharedEmotes ?? []],
              ],
            };
          },
          enabled: !!id,
          retry: false,
          refetchOnMount: false,
          refetchOnReconnect: false,
          refetchOnWindowFocus: false,
        },
        {
          queryKey: ["ffz", id],
          queryFn: async () => {
            const ffzResponse = await fetch(
              `https://api.betterttv.net/3/cached/frankerfacez/users/twitch/${id}`,
              { method: "GET" }
            );

            return { login, response: await ffzResponse.json() };
          },
          enabled: !!id,
          retry: false,
          refetchOnMount: false,
          refetchOnReconnect: false,
          refetchOnWindowFocus: false,
        },
      ]),
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
      ...channels.map(({ login }) => ({
        queryKey: ["7tv", login],
        queryFn: async () => {
          const sevenTvResponse = await fetch(
            `https://api.7tv.app/v2/users/${login}/emotes`,
            { method: "GET" }
          );

          return { login, response: await sevenTvResponse.json() };
        },
        retry: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      })),
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
