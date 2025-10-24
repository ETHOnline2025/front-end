import { useCallback } from "react";
import type { Address } from "viem";

import {
  useSimulateTradingDeposit,
  useWriteTradingDeposit,
} from "@/generated/generated";

export type TradingDepositArgs = {
  caip10Token: string;
  caip10Wallet: string;
  amount: bigint;
  action: number;
  depositorWallet: Address;
};

export function useTradingDeposit({
  address,
  args,
}: {
  address: Address;
  args?: TradingDepositArgs;
}) {
  const simulationArgs = args
    ? ([
        args.caip10Token,
        args.caip10Wallet,
        args.amount,
        args.action,
        args.depositorWallet,
      ] as const)
    : undefined;

  const simulation = useSimulateTradingDeposit({
    address,
    args: simulationArgs,
    query: { enabled: Boolean(args) },
  });

  const { data } = simulation;
  const { writeContract, writeContractAsync, ...writeState } =
    useWriteTradingDeposit();

  const depositAsync = useCallback(() => {
    const request = data?.request;
    if (!request) throw new Error("Deposit simulation not ready.");
    return writeContractAsync(request);
  }, [data?.request, writeContractAsync]);

  return {
    ...writeState,
    writeContract,
    writeContractAsync,
    depositAsync,
    canDeposit: Boolean(data?.request),
    simulation,
  };
}
