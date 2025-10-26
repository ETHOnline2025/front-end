"use client";

import type { ReactNode } from "react";

import { ToastProvider } from "@/components/ui/toast-provider";
import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { anvil, baseSepolia } from "wagmi/chains";
import { OrdersProvider } from "./OrdersProvider";
import { TokensProvider } from "./TokensProvider";

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const clientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID;

// Solana RPC configuration
const solanaRpcUrl =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
const solanaRpcWsUrl =
  process.env.NEXT_PUBLIC_SOLANA_RPC_WS_URL || "wss://api.devnet.solana.com";

const config = createConfig({
  chains: [baseSepolia, anvil],
  transports: {
    [baseSepolia.id]: http(),
    [anvil.id]: http(),
  },
});
const queryClient = new QueryClient();

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={privyAppId!}
      clientId={clientId}
      config={{
        solana: {
          rpcs: {
            "solana:devnet": {
              rpc: createSolanaRpc(solanaRpcUrl),
              rpcSubscriptions: createSolanaRpcSubscriptions(solanaRpcWsUrl),
            },
          },
        },
        // Create embedded wallets for users who login with email and don't have external wallets
        embeddedWallets: {
          ethereum: {
            createOnLogin: "off",
          },
          solana: {
            createOnLogin: "off",
          },
        },

        appearance: {
          walletChainType: "ethereum-and-solana",
          walletList: [
            "metamask",
            "phantom",
            "rainbow",
            "wallet_connect",
            "coinbase_wallet",
          ],
        },
        externalWallets: {
          solana: {
            connectors: toSolanaWalletConnectors({
              shouldAutoConnect: false,
            }),
          },
        },
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <OrdersProvider>
            <TokensProvider>
              <ToastProvider>{children}</ToastProvider>
            </TokensProvider>
          </OrdersProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  );
}
