"use client";

import { useOrders, type Order } from "@/app/providers/OrdersProvider";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, Search } from "lucide-react";
import * as React from "react";
import { useEffect } from "react";

const mockOrderHistory: Order[] = [
  {
    id: "4",
    token: "WETH",
    tokenSymbol: "Wrapped Ethereum",
    walletAddress: "0xC98B57a2eabbA59369744871446864708614300E",
    price: 3100.0,
    amount: 2.0,
    total: 6200.0,
    timestamp: new Date("2025-10-25T14:20:00"),
    status: "completed",
  },
  {
    id: "5",
    token: "Ape",
    tokenSymbol: "Ape",
    walletAddress: "0xC98B57a2eabbA59369744871446864708614300E",
    price: 1.0,
    amount: 10000,
    total: 10000,
    timestamp: new Date("2025-10-25T16:30:00"),
    status: "completed",
  },
  {
    id: "6",
    token: "Ape",
    tokenSymbol: "Ape",
    walletAddress: "0xC98B57a2eabbA59369744871446864708614300E",
    price: 98.5,
    amount: 50,
    total: 4925.0,
    timestamp: new Date("2025-10-25T12:00:00"),
    status: "completed",
  },
  {
    id: "7",
    token: "WETH",
    tokenSymbol: "Wrapped Ethereum",
    walletAddress: "0xC98B57a2eabbA59369744871446864708614300E",
    price: 44800.0,
    amount: 0.5,
    total: 22400.0,
    timestamp: new Date("2025-10-25T09:15:00"),
    status: "cancelled",
  },
];

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "token",
    header: ({ column }) => {
      return (
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Token
          <ArrowUpDown className="h-3 w-3" />
        </button>
      );
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-medium text-blue-400">
          {row.original.token.charAt(0)}
        </div>
        <div>
          <div className="font-medium text-white">{row.original.token}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.tokenSymbol}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "walletAddress",
    header: "Wallet Address",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.walletAddress.slice(0, 6)}...
        {row.original.walletAddress.slice(-4)}
      </span>
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <button
          className="flex items-center gap-1  transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="h-3 w-3" />
        </button>
      );
    },
    cell: ({ row }) => (
      <span className="text-muted-foreground font-medium">
        $
        {row.original.price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })}
      </span>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })}
      </span>
    ),
  },
  {
    accessorKey: "total",
    header: ({ column }) => {
      return (
        <button
          className="flex items-center gap-1  transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total
          <ArrowUpDown className="h-3 w-3" />
        </button>
      );
    },
    cell: ({ row }) => (
      <span className="text-muted-foreground font-semibold">
        $
        {row.original.total.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    ),
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => {
      return (
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Time
          <ArrowUpDown className="h-3 w-3" />
        </button>
      );
    },
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs">
        {row.original.timestamp.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
            status === "completed" && "bg-green-500/10 text-green-400",
            status === "pending" && "bg-blue-500/10 text-blue-400",
            status === "cancelled" && "bg-red-500/10 text-red-400"
          )}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
];

function OrdersTable({ data }: { data: Order[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [tokenFilter, setTokenFilter] = React.useState("");
  const [walletFilter, setWalletFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  useEffect(() => {
    table.getColumn("token")?.setFilterValue(tokenFilter);
  }, [tokenFilter, table]);

  useEffect(() => {
    table.getColumn("walletAddress")?.setFilterValue(walletFilter);
  }, [walletFilter, table]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by token..."
            value={tokenFilter}
            onChange={(e) => setTokenFilter(e.target.value)}
            className="pl-9 bg-[#1a1f2e] border-[#2a2f3e] text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by wallet address..."
            value={walletFilter}
            onChange={(e) => setWalletFilter(e.target.value)}
            className="pl-9 bg-[#1a1f2e] border-[#2a2f3e] text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0b0d0e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup: any) => (
                <tr key={headerGroup.id} className="border-b border-[#2a2f3e]">
                  {headerGroup.headers.map((header: any) => (
                    <th
                      key={header.id}
                      className="h-12 px-4 text-left align-middle text-sm font-medium text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row: any) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#2a2f3e] last:border-0 hover:bg-[#1a1f2e] transition-colors"
                  >
                    {row.getVisibleCells().map((cell: any) => (
                      <td key={cell.id} className="p-4 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {table.getFilteredRowModel().rows.length} of {data.length}{" "}
        orders
      </div>
    </div>
  );
}

export function OrdersTables() {
  const { activeOrders, orderHistory } = useOrders();

  return (
    <div className="rounded-2xl border border-white/5 bg-[#121316] p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tighter text-white">
          Orders
        </h2>
        <p className="text-sm text-wihte/60 mt-1">
          Manage your active and historical orders
        </p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-[#1a1f2e] border border-[#2a2f3e]">
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-[#2563eb]/10 text-gray-400 data-[state=active]:text-[#60a5fa]"
          >
            Active Orders ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-[#2563eb]/10 text-gray-400 data-[state=active]:text-[#60a5fa]"
          >
            Order History ({orderHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6 text-white">
          <OrdersTable data={activeOrders} />
        </TabsContent>

        <TabsContent value="history" className="mt-6 text-white">
          <OrdersTable data={orderHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
