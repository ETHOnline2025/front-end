"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

import type { ChainKey } from "@/components/dashboard/chain-avatar";
import { TOKENS, type Token } from "@/lib/tokens";

type TokensContextValue = {
  tokens: Token[];
  getTokensForChain: (chain: ChainKey) => Token[];
  getTokenById: (id: string) => Token | undefined;
};

const TokensContext = createContext<TokensContextValue | undefined>(undefined);

const EMPTY_TOKENS: Token[] = [];

export function TokensProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => {
    const tokensByChain = TOKENS.reduce(
      (acc, token) => {
        for (const [chainKey, details] of Object.entries(token.chains) as Array<
          [ChainKey, Token["chains"][ChainKey]]
        >) {
          if (!details) continue;
          if (!acc[chainKey]) acc[chainKey] = [];
          acc[chainKey]!.push(token);
        }
        return acc;
      },
      {} as Partial<Record<ChainKey, Token[]>>
    );

    return {
      tokens: TOKENS,
      getTokensForChain: (chain: ChainKey) =>
        tokensByChain[chain] ?? EMPTY_TOKENS,
      getTokenById: (id: string) => TOKENS.find((token) => token.id === id),
    };
  }, []);

  return (
    <TokensContext.Provider value={value}>{children}</TokensContext.Provider>
  );
}

export function useTokensContext() {
  const context = useContext(TokensContext);
  if (!context) {
    throw new Error("useTokensContext must be used within a TokensProvider");
  }
  return context;
}
