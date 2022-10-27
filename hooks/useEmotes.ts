import { useQuery, useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { TwitchUser, BttvEmote, SevenTvEmote } from "../types";

export const useEmotes = (channels: TwitchUser[] = []) => {
  const bttvResults = useQueries({
    queries: [
      {
        queryKey: ["bttv"],
        queryFn: async () => {
          const bttvResponse = await fetch(
            `https://api.betterttv.net/3/cached/emotes/global`,
            { method: "GET" }
          );
          console.log("request bttv");
          return await bttvResponse.json();
        },
        retry: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      },
      ...channels.flatMap(({ id }) => [
        {
          queryKey: ["bttv", id],
          queryFn: async () => {
            const bttvResponse = await fetch(
              `https://api.betterttv.net/3/cached/users/twitch/${id}`,
              { method: "GET" }
            );

            const data = await bttvResponse.json();

            return [...data.channelEmotes, ...data.sharedEmotes];
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

            const data = await ffzResponse.json();
            return data; // [...data.channelEmotes, ...data.sharedEmotes];
          },
          enabled: !!id,
          retry: false,
          refetchOnMount: false,
          refetchOnReconnect: false,
          refetchOnWindowFocus: false,
        },
      ]),
    ],
  });

  const sevenTvResults = useQueries({
    queries: [
      {
        queryKey: ["7tv"],
        queryFn: async () => {
          const sevenTvResponse = await fetch(
            "https://api.7tv.app/v2/emotes/global",
            { method: "GET" }
          );
          console.log("request 7tv");

          return await sevenTvResponse.json();
        },
        retry: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      },
      ...channels.map(({ login }) => ({
        queryKey: ["7tv", login],
        queryFn: async () => {
          const sevenTvResponse = await fetch(
            `https://api.7tv.app/v2/users/${login}/emotes`,
            { method: "GET" }
          );
          console.log(`request 7tv channel ${login}`);

          return await sevenTvResponse.json();
        },
        retry: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      })),
    ],
  });

  const bttvEmotes = useMemo(() => {
    const results: any[] = [];

    bttvResults.forEach((res) => {
      if (res.data && Array.isArray(res.data)) {
        results.push(...res.data);
      }
    });

    return results;
  }, [bttvResults]);

  const sevenTvEmotes = useMemo(() => {
    const results: any[] = [];

    sevenTvResults.forEach((res) => {
      if (res.data && Array.isArray(res.data)) {
        results.push(...res.data);
      }
    });

    return results;
  }, [sevenTvResults]);

  const sevenTvMap: Record<string, SevenTvEmote> = useMemo(() => {
    return (
      sevenTvEmotes?.reduce(
        (acc: Record<string, SevenTvEmote>, item: SevenTvEmote) => {
          return {
            ...acc,
            [item.name]: {
              ...item,
            },
          };
        },
        {}
      ) ?? {}
    );
  }, [sevenTvEmotes]);

  const bttvMap: Record<string, BttvEmote> = useMemo(() => {
    return (
      bttvEmotes?.reduce((acc: Record<string, BttvEmote>, item: BttvEmote) => {
        return {
          ...acc,
          [item.code]: {
            ...item,
          },
        };
      }, {}) ?? {}
    );
  }, [bttvEmotes]);

  const emoteCodes = Array.from(
    new Set([...Object.keys(bttvMap), ...Object.keys(sevenTvMap)])
  );

  const emoteRegexp = useMemo(() => {
    const regexp = `\\b(${emoteCodes.join("|")})\\b`;

    return new RegExp(regexp, "g");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emoteCodes]);

  return { emoteRegexp, bttvMap, sevenTvMap };
};
