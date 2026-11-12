import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { buildFootballGames, fetchFootballChannels, fetchFootballEpg, fetchFootballEvents, FOOTBALL_REFRESH_MS } from "@/lib/football";

export function useFootballGames(autoRefresh = true) {
  const events = useQuery({
    queryKey: ["embedtv", "events"],
    queryFn: ({ signal }) => fetchFootballEvents(signal),
    staleTime: FOOTBALL_REFRESH_MS,
    refetchInterval: autoRefresh ? FOOTBALL_REFRESH_MS : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: autoRefresh,
    retry: 1,
  });
  const channels = useQuery({
    queryKey: ["embedtv", "channels"],
    queryFn: ({ signal }) => fetchFootballChannels(signal),
    staleTime: 15 * 60 * 1000,
    retry: 1,
  });
  const epg = useQuery({
    queryKey: ["embedtv", "epg"],
    queryFn: ({ signal }) => fetchFootballEpg(signal),
    staleTime: 5 * 60 * 1000,
    refetchInterval: autoRefresh ? 5 * 60 * 1000 : false,
    refetchIntervalInBackground: false,
    retry: 1,
  });
  const games = useMemo(() => events.data ? buildFootballGames(events.data, channels.data, epg.data) : undefined,
    [events.data, events.dataUpdatedAt, channels.data, epg.data]);
  return {
    ...events,
    data: games,
    refetch: () => Promise.all([events.refetch(), channels.refetch(), epg.refetch()]),
  };
}
