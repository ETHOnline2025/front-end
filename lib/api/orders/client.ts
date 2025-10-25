import { fetchWithError } from "../shared/errors";
import type { ApiResponse, Order, OrderData } from "../types";

export const ordersApi = {
  // GET /api/orders/ - Get all orders
  getOrders: async (): Promise<Order[]> => {
    const response = await fetchWithError<ApiResponse<Order[]>>("/api/orders/");
    return response.data;
  },

  // POST /api/orders/ - Create new order
  createOrder: async (orderData: OrderData): Promise<Order> => {
    const response = await fetchWithError<ApiResponse<Order>>("/api/orders/", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
    return response.data;
  },

  // DELETE /api/orders/:orderId - Delete order
  deleteOrder: async (orderId: string): Promise<void> => {
    await fetchWithError(`/api/orders/${orderId}`, {
      method: "DELETE",
    });
  },
};

// Helper function for the sendOrder example from your specification
export const sendOrder = (
  amount: number,
  side: "BUY" | "SELL",
  price: number,
  caip10Token: string,
  caip10Wallet: string
): Promise<Order> => {
  return ordersApi.createOrder({
    amount,
    side,
    price,
    caip10Token,
    caip10Wallet,
  });
};
