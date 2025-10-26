"use client";

import { createContext, ReactNode, useContext, useState } from "react";

export type Order = {
  id: string;
  token: string;
  tokenSymbol: string;
  walletAddress: string;
  price: number;
  amount: number;
  total: number;
  timestamp: Date;
  status: "completed" | "pending" | "cancelled";
};

interface OrdersContextType {
  activeOrders: Order[];
  orderHistory: Order[];
  addOrder: (order: Omit<Order, "id" | "timestamp">) => void;
  addCompletedOrder: (order: Omit<Order, "id" | "timestamp">) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([
    // {
    //   id: "4",
    //   token: "WETH",
    //   tokenSymbol: "Wrapped Ethereum",
    //   walletAddress: "0xC98B57a2eabbA59369744871446864708614300E",
    //   price: 3100.0,
    //   amount: 2.0,
    //   total: 6200.0,
    //   timestamp: new Date("2025-01-19T14:20:00"),
    //   status: "completed",
    // },
    // {
    //   id: "5",
    //   token: "Ape",
    //   tokenSymbol: "Ape",
    //   walletAddress: "0xC98B57a2eabbA59369744871446864708614300E",
    //   price: 1.0,
    //   amount: 10000,
    //   total: 10000,
    //   timestamp: new Date("2025-01-19T16:30:00"),
    //   status: "completed",
    // },
    // {
    //   id: "6",
    //   token: "Ape",
    //   tokenSymbol: "Ape",
    //   walletAddress: "0xC98B57a2eabbA59369744871446864708614300E",
    //   price: 98.5,
    //   amount: 50,
    //   total: 4925.0,
    //   timestamp: new Date("2025-01-18T12:00:00"),
    //   status: "completed",
    // },
    // {
    //   id: "7",
    //   token: "WETH",
    //   tokenSymbol: "Wrapped Ethereum",
    //   walletAddress: "0xC98B57a2eabbA59369744871446864708614300E",
    //   price: 44800.0,
    //   amount: 0.5,
    //   total: 22400.0,
    //   timestamp: new Date("2025-01-17T09:15:00"),
    //   status: "cancelled",
    // },
  ]);

  const addOrder = (orderData: Omit<Order, "id" | "timestamp">) => {
    const newOrder: Order = {
      ...orderData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };

    // Add to active orders initially
    setActiveOrders((prev) => [newOrder, ...prev]);

    // Move to order history after 20 seconds
    setTimeout(() => {
      setActiveOrders((prev) =>
        prev.filter((order) => order.id !== newOrder.id)
      );
      setOrderHistory((prev) => [
        { ...newOrder, status: "completed" as const },
        ...prev,
      ]);
    }, 20000); // 20 seconds
  };

  const addCompletedOrder = (orderData: Omit<Order, "id" | "timestamp">) => {
    const newOrder: Order = {
      ...orderData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      status: "completed",
    };

    // Add directly to order history since it's already completed
    setOrderHistory((prev) => [newOrder, ...prev]);
  };

  return (
    <OrdersContext.Provider
      value={{ activeOrders, orderHistory, addOrder, addCompletedOrder }}
    >
      {children}
    </OrdersContext.Provider>
  );
}
