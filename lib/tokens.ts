import type { ChainKey } from "@/components/dashboard/chain-avatar";
import type { Address } from "viem";
import { anvil, arbitrumSepolia, baseSepolia, sepolia } from "wagmi/chains";

export type TokenChainConfig = {
  caip10Token: string;
  tokenAddress?: Address;
  isNative?: boolean;
};

export type Token = {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  price: number;
  change: number;
  icon: string;
  chains: Partial<Record<ChainKey, TokenChainConfig>>;
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;
const SEPOLIA_PREFIX = `eip155:${sepolia.id}`;
const ARBITRUM_PREFIX = `eip155:${arbitrumSepolia.id}`;
const BASE_PREFIX = `eip155:${baseSepolia.id}`;
const ANVIL_PREFIX = `eip155:${anvil.id}`;
const SOLANA_PREFIX = "solana:mainnet";

const buildEvmCaipToken = (prefix: string, tokenAddress: Address) =>
  `${prefix}:${tokenAddress.toLowerCase()}`;

const DEFAULT_SOL_CAIP_TOKEN =
  process.env.NEXT_PUBLIC_SOLANA_SOL_CAIP10 ??
  "solana:mainnet:So11111111111111111111111111111111111111112";

const rawAnvilTokenAddress = process.env.NEXT_PUBLIC_ANVIL_TOKEN_ADDRESS;
const anvilTokenAddress =
  rawAnvilTokenAddress && rawAnvilTokenAddress.startsWith("0x")
    ? (rawAnvilTokenAddress as Address)
    : undefined;

const rawBaseSepoliaTokenAddress =
  process.env.NEXT_PUBLIC_BASE_SEPOLIA_TOKEN_ADDRESS;
const baseSepoliaTokenAddress =
  rawBaseSepoliaTokenAddress && rawBaseSepoliaTokenAddress.startsWith("0x")
    ? (rawBaseSepoliaTokenAddress as Address)
    : undefined;

export const TOKENS: Token[] = [
  {
    id: "weth",
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    price: 3120,
    change: 2.5,
    icon: "🟦",
    chains: {
      ethereum: {
        caip10Token: buildEvmCaipToken(SEPOLIA_PREFIX, ZERO_ADDRESS),
        isNative: true,
      },
      arbitrum: {
        caip10Token: buildEvmCaipToken(ARBITRUM_PREFIX, ZERO_ADDRESS),
        isNative: true,
      },
      base: {
        caip10Token: buildEvmCaipToken(
          BASE_PREFIX,
          baseSepoliaTokenAddress || ZERO_ADDRESS
        ),
        tokenAddress: baseSepoliaTokenAddress,
        isNative: !baseSepoliaTokenAddress,
      },
      ...(anvilTokenAddress
        ? {
            anvil: {
              caip10Token: buildEvmCaipToken(ANVIL_PREFIX, anvilTokenAddress),
              tokenAddress: anvilTokenAddress,
            },
          }
        : {}),
    },
  },
  // {
  //   id: "usdc",
  //   symbol: "USDC",
  //   name: "USD Coin",
  //   decimals: 6,
  //   price: 1,
  //   change: -0.1,
  //   icon: "🟢",
  //   chains: {},
  // },
  {
    id: "ape",
    symbol: "Ape",
    name: "Ape",
    decimals: 6,
    price: 1,
    change: 0.01,
    icon: "🟣",
    chains: {
      solana: {
        caip10Token: DEFAULT_SOL_CAIP_TOKEN,
      },
    },
  },
  // {
  //   id: "avax",
  //   symbol: "AVAX",
  //   name: "Avalanche",
  //   decimals: 18,
  //   price: 42.9,
  //   change: 4.5,
  //   icon: "🔺",
  //   chains: {},
  // },
];

export const CAIP_PREFIX_MAP: Partial<Record<ChainKey, string>> = {
  ethereum: SEPOLIA_PREFIX,
  arbitrum: ARBITRUM_PREFIX,
  base: BASE_PREFIX,
  anvil: ANVIL_PREFIX,
  solana: SOLANA_PREFIX,
};
