import type { Address } from "viem";

import type { ChainKey } from "@/components/dashboard/chain-avatar";

const SEPOLIA_ADDRESS =
  process.env.NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS as Address | undefined;
const ARBITRUM_ADDRESS =
  process.env.NEXT_PUBLIC_ARBITRUM_CONTRACT_ADDRESS as Address | undefined;
const ANVIL_ADDRESS =
  process.env.NEXT_PUBLIC_ANVIL_CONTRACT_ADDRESS as Address | undefined;
const SOLANA_ADDRESS =
  process.env.NEXT_PUBLIC_SOLANA_CONTRACT_ADDRESS as Address | undefined;

export const TRADING_CONTRACT_ADDRESS_MAP: Partial<Record<ChainKey, Address>> = {
  ethereum: SEPOLIA_ADDRESS,
  arbitrum: ARBITRUM_ADDRESS,
  anvil: ANVIL_ADDRESS,
  solana: SOLANA_ADDRESS,
};

export function getTradingContractAddress(chain: ChainKey): Address | undefined {
  return TRADING_CONTRACT_ADDRESS_MAP[chain];
}
