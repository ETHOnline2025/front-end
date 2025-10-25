import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../shared/query-keys";
import { tradesApi } from "./client";

// Get all trades
export const useTrades = () => {
  return useQuery({
    queryKey: queryKeys.trades,
    queryFn: tradesApi.getTrades,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 15 * 1000, // Refetch every 15 seconds for trade history
  });
};

// Get recent trades (you can modify this based on your needs)
export const useRecentTrades = (limit?: number) => {
  return useQuery({
    queryKey: [...queryKeys.trades, "recent", limit],
    queryFn: async () => {
      const trades = await tradesApi.getTrades();
      return limit ? trades.slice(-limit) : trades;
    },
    staleTime: 30 * 1000,
  });
};
