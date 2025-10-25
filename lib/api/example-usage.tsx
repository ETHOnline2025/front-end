import {
  useCreateOrder,
  useDeleteOrder,
  useOrders,
  useTrades,
  useWithdraw,
  type OrderData,
  type WithdrawData,
} from "@/lib/api";

export default function TradingExample() {
  // Fetch orders and trades
  const {
    data: orders,
    isLoading: ordersLoading,
    error: ordersError,
  } = useOrders();
  const { data: trades, isLoading: tradesLoading } = useTrades();

  // Mutations
  const createOrderMutation = useCreateOrder();
  const deleteOrderMutation = useDeleteOrder();
  const withdrawMutation = useWithdraw();

  // Example: Create a new order
  const handleCreateOrder = async () => {
    const orderData: OrderData = {
      amount: 1300,
      side: "BUY",
      price: 0.6,
      caip10Token:
        "solana:mainnet:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv",
      caip10Wallet:
        "solana:mainnet:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv",
    };

    try {
      const newOrder = await createOrderMutation.mutateAsync(orderData);
      console.log("Order created:", newOrder);
    } catch (error) {
      console.error("Failed to create order:", error);
    }
  };

  // Example: Delete an order
  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrderMutation.mutateAsync(orderId);
      console.log("Order deleted successfully");
    } catch (error) {
      console.error("Failed to delete order:", error);
    }
  };

  // Example: Withdraw
  const handleWithdraw = async () => {
    const withdrawData: WithdrawData = {
      amount: 100,
      caip10Token:
        "solana:mainnet:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv",
      caip10Wallet:
        "solana:mainnet:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv",
    };

    try {
      const result = await withdrawMutation.mutateAsync(withdrawData);
      console.log("Withdrawal result:", result);
    } catch (error) {
      console.error("Failed to withdraw:", error);
    }
  };

  if (ordersLoading) return <div>Loading orders...</div>;
  if (ordersError)
    return <div>Error loading orders: {ordersError.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Trading Example</h1>

      {/* Create Order Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Create Order</h2>
        <button
          onClick={handleCreateOrder}
          disabled={createOrderMutation.isPending}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {createOrderMutation.isPending
            ? "Creating..."
            : "Create Sample Order"}
        </button>
        {createOrderMutation.error && (
          <p className="text-red-500 mt-2">
            Error: {createOrderMutation.error.message}
          </p>
        )}
      </div>

      {/* Orders Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Order Book</h2>
        <div className="grid gap-2">
          {orders?.map((order) => (
            <div
              key={order.id}
              className="border p-3 rounded flex justify-between items-center"
            >
              <div>
                <span
                  className={`font-semibold ${order.side === "BUY" ? "text-green-600" : "text-red-600"}`}
                >
                  {order.side}
                </span>
                <span className="ml-2">Amount: {order.amount}</span>
                <span className="ml-2">Price: ${order.price}</span>
                <span className="ml-2">Status: {order.status}</span>
              </div>
              <button
                onClick={() => handleDeleteOrder(order.id)}
                disabled={deleteOrderMutation.isPending}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                {deleteOrderMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))}
          {orders?.length === 0 && (
            <p className="text-gray-500">No orders found</p>
          )}
        </div>
      </div>

      {/* Trades Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Recent Trades</h2>
        {tradesLoading ? (
          <p>Loading trades...</p>
        ) : (
          <div className="grid gap-2">
            {trades?.map((trade) => (
              <div key={trade.id} className="border p-3 rounded">
                <div>Trade ID: {trade.id}</div>
                <div>
                  Amount: {trade.amount} @ ${trade.price}
                </div>
                <div>
                  Executed: {new Date(trade.executedAt).toLocaleString()}
                </div>
              </div>
            ))}
            {trades?.length === 0 && (
              <p className="text-gray-500">No trades found</p>
            )}
          </div>
        )}
      </div>

      {/* Withdraw Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Withdraw</h2>
        <button
          onClick={handleWithdraw}
          disabled={withdrawMutation.isPending}
          className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {withdrawMutation.isPending
            ? "Processing..."
            : "Withdraw Sample Amount"}
        </button>
        {withdrawMutation.error && (
          <p className="text-red-500 mt-2">
            Error: {withdrawMutation.error.message}
          </p>
        )}
        {withdrawMutation.data && (
          <p className="text-green-500 mt-2">
            Withdrawal successful! Transaction ID:{" "}
            {withdrawMutation.data.transactionId}
          </p>
        )}
      </div>
    </div>
  );
}
