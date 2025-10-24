import { useReadTradingGetFeeInfo } from "@/generated/generated";
import { Address } from "viem";

export function useTradingFeeInfo({
  address,
  amount,
  caip10Wallet,
  caip10Token,
  enabled = true,
}: {
  address: Address;
  amount?: bigint;
  caip10Wallet?: string;
  caip10Token?: string;
  enabled?: boolean;
}) {
  const args =
    amount !== undefined && caip10Wallet && caip10Token
      ? ([amount, caip10Wallet, caip10Token] as const)
      : undefined;

  return useReadTradingGetFeeInfo({
    address,
    args,
    query: { enabled: Boolean(enabled && args) },
  });
}
