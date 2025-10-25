export type OrderSide = "BUY" | "SELL";

export interface OrderData {
  amount: number;
  side: OrderSide;
  price: number;
  caip10Token: string;
  caip10Wallet: string;
}

export interface Order extends OrderData {
  id: string;
  createdAt: string;
  status: "OPEN" | "FILLED" | "CANCELLED";
  updatedAt: string;
}

export interface Trade {
  id: string;
  orderId: string;
  amount: number;
  price: number;
  executedAt: string;
  buyerWallet: string;
  sellerWallet: string;
  caip10Token: string;
}

export interface WithdrawData {
  amount: number;
  caip10Token: string;
  caip10Wallet: string;
}

export interface WithdrawResponse {
  success: boolean;
  transactionId?: string;
  message?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}
