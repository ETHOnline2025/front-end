import { useCallback } from "react";
import type { Address } from "viem";

import {
  useSimulateTradingWithdraw,
  useWriteTradingWithdraw,
} from "@/generated/generated";

export type TradingWithdrawArgs = {
  caip10Token: string;
  caip10WalletOrName: string;
  amount: bigint;
  action: number;
};

export function useTradingWithdraw({
  address,
  args,
}: {
  address: Address;
  args?: TradingWithdrawArgs;
}) {
  const simulationArgs = args
    ? ([args.caip10Token, args.caip10WalletOrName, args.amount, args.action] as const)
    : undefined;

  const simulation = useSimulateTradingWithdraw({
    address,
    args: simulationArgs,
    query: { enabled: Boolean(args) },
  });

  const { data } = simulation;
  const {
    writeContract,
    writeContractAsync,
    ...writeState
  } = useWriteTradingWithdraw();

  const withdraw = useCallback(() => {
    const request = data?.request;
    if (!request) throw new Error("Withdraw simulation not ready.");
    return writeContract(request);
  }, [data?.request, writeContract]);

  const withdrawAsync = useCallback(() => {
    const request = data?.request;
    if (!request) throw new Error("Withdraw simulation not ready.");
    return writeContractAsync(request);
  }, [data?.request, writeContractAsync]);

  return {
    ...writeState,
    writeContract,
    writeContractAsync,
    withdraw,
    withdrawAsync,
    canWithdraw: Boolean(data?.request),
    simulation,
  };
}
