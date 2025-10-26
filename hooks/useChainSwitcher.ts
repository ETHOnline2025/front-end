"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChainId, useSwitchChain } from "wagmi";
import { anvil, arbitrumSepolia, baseSepolia, sepolia } from "wagmi/chains";

import type { ChainKey } from "@/components/dashboard/chain-avatar";

export type BaseChainOption = {
  key: ChainKey;
  name: string;
  detail: string;
  description?: string;
  wagmiId?: number;
  chainIcon?: string;
};

export type ChainOption = BaseChainOption & {
  badge?: string;
};

export const BASE_CHAIN_OPTIONS: BaseChainOption[] = [
  {
    key: "base",
    name: "Base Sepolia",
    detail: "Base Sepolia testnet",
    wagmiId: baseSepolia.id,
    chainIcon: "base",
  },
  // {
  //   key: "arbitrum",
  //   name: "Arbitrum",
  //   detail: "Sepolia testnet",
  //   description: "Lower fees with optimistic rollup security.",
  //   wagmiId: arbitrumSepolia.id,
  // },
  {
    key: "anvil",
    name: "Anvil",
    detail: "Local devnet",
    wagmiId: anvil.id,
  },
  {
    key: "solana",
    name: "Solana",
    detail: "Mainnet beta",
    chainIcon: "solana",
  },
];

export const chainIdToKey = (id?: number | null): ChainKey => {
  if (id === arbitrumSepolia.id) return "arbitrum";
  if (id === sepolia.id) return "ethereum";
  if (id === baseSepolia.id) return "base";
  if (id === anvil.id) return "anvil";
  return "base";
};

type SwitchSuccessPayload = {
  id: number;
  name?: string;
  nativeCurrency?: {
    symbol?: string;
  };
};

type UseChainSwitcherHandlers = {
  onSolanaSelected?: () => void;
  onSwitchSuccess?: (
    option: BaseChainOption,
    data: SwitchSuccessPayload
  ) => void;
  onSwitchError?: (error: unknown) => void;
};

export function useChainSwitcher(handlers: UseChainSwitcherHandlers = {}) {
  const { onSolanaSelected, onSwitchSuccess, onSwitchError } = handlers;
  const chainId = useChainId();

  const [selectedChainKey, setSelectedChainKey] = useState<ChainKey>(() =>
    chainIdToKey(chainId)
  );
  const [pendingChainKey, setPendingChainKey] = useState<ChainKey | null>(null);

  const lastChainIdRef = useRef<number | null>(chainId ?? null);

  const { switchChain, isPending: isSwitching } = useSwitchChain({
    mutation: {
      onSuccess: (data) => {
        const key = chainIdToKey(data.id);
        const option = BASE_CHAIN_OPTIONS.find((item) => item.key === key) ?? {
          key,
          name: data.name,
          detail: "",
          description: "",
          wagmiId: data.id,
        };

        setSelectedChainKey(key);
        setPendingChainKey(null);
        onSwitchSuccess?.(option, {
          id: data.id,
          name: data.name,
          nativeCurrency: data.nativeCurrency,
        });
      },
      onError: (error) => {
        setPendingChainKey(null);
        onSwitchError?.(error);
      },
    },
  });

  useEffect(() => {
    const normalizedChainId = chainId ?? null;
    if (normalizedChainId !== lastChainIdRef.current) {
      lastChainIdRef.current = normalizedChainId;
      if (normalizedChainId !== null) {
        setSelectedChainKey(chainIdToKey(normalizedChainId));
      }
    }
  }, [chainId]);

  const chainOptions: ChainOption[] = useMemo(
    () =>
      BASE_CHAIN_OPTIONS.map((option) => ({
        ...option,
        badge:
          option.key === "solana"
            ? selectedChainKey === "solana"
              ? "Active"
              : ""
            : selectedChainKey === option.key
              ? "Active"
              : undefined,
      })),
    [selectedChainKey]
  );

  const selectChain = (option: BaseChainOption) => {
    if (option.key === "solana") {
      setSelectedChainKey("solana");
      setPendingChainKey(null);
      onSolanaSelected?.();
      return;
    }

    if (!option.wagmiId) return;
    setPendingChainKey(option.key);
    switchChain({ chainId: option.wagmiId });
  };

  return {
    chainOptions,
    selectedChainKey,
    pendingChainKey,
    isSwitching,
    selectChain,
  };
}
