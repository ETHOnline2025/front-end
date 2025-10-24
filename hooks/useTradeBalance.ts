import { useReadTradingGetTradeBalance } from "@/generated/generated";
import { Address } from "viem";

export function useTradeBalance({
  address,
  caip10Wallet,
  caip10Token,
  enabled = true,
}: {
  address: Address;
  caip10Wallet?: string;
  caip10Token?: string;
  enabled?: boolean;
}) {
  const args =
    caip10Wallet && caip10Token
      ? ([caip10Wallet, caip10Token] as const)
      : undefined;

  return useReadTradingGetTradeBalance({
    address,
    args,
    query: { enabled: Boolean(enabled && args) },
  });
}
