// Export all types
export type {
  ApiError,
  ApiResponse,
  Order,
  OrderData,
  OrderSide,
  Trade,
  WithdrawData,
  WithdrawResponse,
} from "./types";

// Export shared utilities
export { ApiClientError } from "./shared/errors";
export { queryKeys } from "./shared/query-keys";

// Export orders API and hooks
export {
  ordersApi,
  sendOrder,
  useCreateOrder,
  useDeleteOrder,
  useOrderBook,
  useOrders,
  useOrdersByType,
} from "./orders";

// Export trades API and hooks
export { tradesApi, useRecentTrades, useTrades } from "./trades";

// Export balance API and hooks
export { balanceApi, useWithdraw } from "./balance";

// Re-export TanStack Query utilities that users might need
export { useQueryClient } from "@tanstack/react-query";
