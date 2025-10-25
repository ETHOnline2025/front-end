import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../shared/query-keys";
import type { Order } from "../types";
import { ordersApi } from "./client";

// Create new order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ordersApi.createOrder,
    onSuccess: (newOrder: Order) => {
      // Update the orders cache optimistically
      queryClient.setQueryData(
        queryKeys.orders,
        (oldData: Order[] | undefined) => {
          if (!oldData) return [newOrder];
          return [...oldData, newOrder];
        }
      );

      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
    onError: (error) => {
      console.error("Failed to create order:", error);
      // Optionally invalidate queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
};

// Delete order
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ordersApi.deleteOrder,
    onSuccess: (_, orderId: string) => {
      // Remove the order from cache optimistically
      queryClient.setQueryData(
        queryKeys.orders,
        (oldData: Order[] | undefined) => {
          if (!oldData) return [];
          return oldData.filter((order) => order.id !== orderId);
        }
      );

      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
    onError: (error) => {
      console.error("Failed to delete order:", error);
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
};
