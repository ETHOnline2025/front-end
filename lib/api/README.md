# API Client & React Query Hooks

This directory contains the complete API client setup using TanStack Query (React Query) for the ETH Global project.

## Structure

```
lib/api/
├── index.ts                    # Main export file
├── types.ts                    # TypeScript type definitions
├── example-usage.tsx           # Usage examples
├── README.md                   # This file
├── shared/
│   ├── errors.ts              # Error handling utilities
│   └── query-keys.ts          # Shared query keys
├── orders/
│   ├── index.ts               # Orders exports
│   ├── client.ts              # Orders API client
│   ├── queries.ts             # Orders query hooks
│   └── mutations.ts           # Orders mutation hooks
├── trades/
│   ├── index.ts               # Trades exports
│   ├── client.ts              # Trades API client
│   └── queries.ts             # Trades query hooks
└── balance/
    ├── index.ts               # Balance exports
    ├── client.ts              # Balance API client
    └── mutations.ts           # Balance mutation hooks
```

## Features

- ✅ Full TypeScript support with strict typing
- ✅ Automatic caching and background refetching
- ✅ Optimistic updates for better UX
- ✅ Error handling and retry logic
- ✅ Real-time data synchronization
- ✅ Loading and error states management
- ✅ Modular organization by feature area
- ✅ Separate queries and mutations for better maintainability

## Architecture

The API client is organized into feature-based modules:

- **`shared/`** - Common utilities and error handling
- **`orders/`** - Order management (queries and mutations)
- **`trades/`** - Trade history (queries only)
- **`balance/`** - Balance operations (mutations only)

Each feature module contains:

- `client.ts` - Raw API functions
- `queries.ts` - useQuery hooks for data fetching
- `mutations.ts` - useMutation hooks for data modification
- `index.ts` - Feature exports

## Available Endpoints

### Orders

- `GET /api/orders/` - Fetch all orders
- `POST /api/orders/` - Create new order
- `DELETE /api/orders/:orderId` - Delete order

### Trades

- `GET /api/trades/` - Fetch all trades

### Balance

- `POST /api/balance/withdraw` - Withdraw balance

## Available Hooks

### Query Hooks (Data Fetching)

```typescript
import { useOrders, useTrades } from "@/lib/api";

// Fetch all orders with auto-refresh every 10 seconds
const { data: orders, isLoading, error } = useOrders();

// Fetch all trades with auto-refresh every 15 seconds
const { data: trades, isLoading: tradesLoading } = useTrades();

// Get orders by side (BUY/SELL)
const { data: buyOrders } = useOrdersByType("BUY");

// Get recent trades (limited)
const { data: recentTrades } = useRecentTrades(10);
```

### Mutation Hooks (Data Modification)

```typescript
import { useCreateOrder, useDeleteOrder, useWithdraw } from "@/lib/api";

// Create new order
const createOrder = useCreateOrder();
const handleCreate = async () => {
  await createOrder.mutateAsync({
    amount: 1300,
    side: "BUY",
    price: 0.6,
    caip10Token: "solana:mainnet:...",
    caip10Wallet: "solana:mainnet:...",
  });
};

// Delete order
const deleteOrder = useDeleteOrder();
const handleDelete = async (orderId: string) => {
  await deleteOrder.mutateAsync(orderId);
};

// Withdraw
const withdraw = useWithdraw();
const handleWithdraw = async () => {
  await withdraw.mutateAsync({
    amount: 100,
    caip10Token: "solana:mainnet:...",
    caip10Wallet: "solana:mainnet:...",
  });
};
```

## Usage Examples

### Basic Usage in a Component

```typescript
import React from 'react';
import { useOrders, useCreateOrder } from '@/lib/api';

export default function OrderBook() {
  const { data: orders, isLoading } = useOrders();
  const createOrder = useCreateOrder();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Order Book</h2>
      {orders?.map(order => (
        <div key={order.id}>
          {order.side} - {order.amount} @ ${order.price}
        </div>
      ))}

      <button
        onClick={() => createOrder.mutate({
          amount: 100,
          side: 'BUY',
          price: 1.0,
          caip10Token: '...',
          caip10Wallet: '...'
        })}
        disabled={createOrder.isPending}
      >
        {createOrder.isPending ? 'Creating...' : 'Create Order'}
      </button>
    </div>
  );
}
```

### Using the sendOrder Helper Function

```typescript
import { sendOrder } from "@/lib/api";

// Direct API call (matches your specification)
const order = await sendOrder(
  1300,
  "BUY",
  0.6,
  "solana:mainnet:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv",
  "solana:mainnet:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv"
);
```

## Configuration

### Environment Variables

Make sure to set your API base URL:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
```

### Query Client Configuration

The QueryClient is already configured in `app/providers/AppProviders.tsx` with TanStack Query integrated.

## Caching Strategy

- **Orders**: 5-second stale time, 10-second refetch interval (real-time order book)
- **Trades**: 30-second stale time, 15-second refetch interval (trade history)
- **Mutations**: Automatic cache updates with optimistic UI updates

## Error Handling

All API calls include comprehensive error handling:

- Network errors
- HTTP status errors
- JSON parsing errors
- Custom error messages from the API

Errors are automatically typed and include status codes and optional error codes.

## TypeScript Support

All hooks and functions are fully typed:

- Request/response types
- Error types
- Loading states
- Mutation states

## Advanced Usage

### Manual Cache Management

```typescript
import { useQueryClient, queryKeys } from "@/lib/api";

const queryClient = useQueryClient();

// Manually refetch orders
queryClient.invalidateQueries({ queryKey: queryKeys.orders });

// Get cached data
const cachedOrders = queryClient.getQueryData(queryKeys.orders);

// Set data manually
queryClient.setQueryData(queryKeys.orders, newOrdersData);
```

### Custom Query Options

```typescript
const { data } = useOrders({
  refetchInterval: 5000, // Custom refetch interval
  enabled: someCondition, // Conditional fetching
  onSuccess: (data) => {
    // Custom success handler
  },
});
```

## Testing

For testing components that use these hooks, use React Query's testing utilities:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      {component}
    </QueryClientProvider>
  );
};
```

## Migration Notes

Since TanStack Query is already installed and configured in your project, you can start using these hooks immediately without any additional setup.
