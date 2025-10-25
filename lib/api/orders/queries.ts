import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../shared/query-keys";
import { ordersApi } from "./client";

// Get all orders
export const useOrders = () => {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: ordersApi.getOrders,
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds for order book
  });
};

// Get orders by side (BUY/SELL)
export const useOrdersByType = (side?: "BUY" | "SELL") => {
  return useQuery({
    queryKey: [...queryKeys.orders, "by-side", side],
    queryFn: async () => {
      const orders = await ordersApi.getOrders();
      return side ? orders.filter((order) => order.side === side) : orders;
    },
    enabled: !!side,
    staleTime: 5 * 1000,
  });
};

// Alias for semantic clarity
export const useOrderBook = useOrders;
