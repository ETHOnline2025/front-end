"use client";

import type { ReactNode } from "react";

import { ToastProvider } from "@/components/ui/toast-provider";
import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { anvil, arbitrumSepolia, sepolia } from "wagmi/chains";
import { TokensProvider } from "./TokensProvider";

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const clientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID;

const config = createConfig({
  chains: [arbitrumSepolia, sepolia, anvil],
  transports: {
    [arbitrumSepolia.id]: http(),
    [sepolia.id]: http(),
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
        //TODO: add rpc to send tx
        //  solana: {
        //   rpcs: {
        //     'solana:mainnet': {
        //       rpc: createSolanaRpc('https://api.mainnet-beta.solana.com'), // or your custom RPC endpoint
        //       rpcSubscriptions: createSolanaRpcSubscriptions('wss://api.mainnet-beta.solana.com') // or your custom RPC endpoint
        //     }
        //   }
        // },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
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
        externalWallets: { solana: { connectors: toSolanaWalletConnectors() } },
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <TokensProvider>
            <ToastProvider>{children}</ToastProvider>
          </TokensProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  );
}
