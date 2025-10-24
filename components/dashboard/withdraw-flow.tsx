"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { formatUnits, parseUnits, type Address, type Hash } from "viem";
import { useAccount, usePublicClient } from "wagmi";

import { useTokensContext } from "@/app/providers/TokensProvider";
import type { ChainKey } from "@/components/dashboard/chain-avatar";
import { getPrimarySymbol } from "@/components/dashboard/chain-avatar";
import { WithdrawModal } from "@/components/modals/withdraw-modal";
import { useToast } from "@/components/ui/toast-provider";
import { BASE_CHAIN_OPTIONS } from "@/hooks/useChainSwitcher";
import { useTradeBalance } from "@/hooks/useTradeBalance";
import {
  useTradingWithdraw,
  type TradingWithdrawArgs,
} from "@/hooks/useWithdraw";
import { getTradingContractAddress } from "@/lib/contracts";
import { getErrorMessage } from "@/lib/errors";
import { CAIP_PREFIX_MAP } from "@/lib/tokens";

type ActivityStatus = "pending" | "success" | "error";

export type WithdrawFlowActivityEvent = {
  action: "withdraw";
  status: ActivityStatus;
  amount: string;
  symbol: string;
  chainLabel: string;
  message?: string;
  hash?: Hash;
};

type WithdrawFlowProps = {
  chainKey: ChainKey;
  trigger: (props: { open: () => void; isProcessing: boolean }) => ReactNode;
  defaultAmount?: string;
  onActivityEvent?: (event: WithdrawFlowActivityEvent) => void;
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;
const ACTION_NATIVE = 0;
const ACTION_OTHER_CHAIN = 1;

export function WithdrawFlow({
  chainKey,
  trigger,
  defaultAmount = "0.00",
  onActivityEvent,
}: WithdrawFlowProps) {
  const { toast } = useToast();
  const { address: accountAddress } = useAccount();
  const publicClient = usePublicClient();
  const { getTokensForChain, getTokenById } = useTokensContext();

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<string>(defaultAmount);
  const [selectedTokenId, setSelectedTokenId] = useState<string | undefined>(
    undefined
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingTxHash, setPendingTxHash] = useState<Hash | undefined>(
    undefined
  );

  const contractAddress = getTradingContractAddress(chainKey);
  const chainMeta = BASE_CHAIN_OPTIONS.find(
    (option) => option.key === chainKey
  );
  const chainLabel = chainMeta?.name ?? chainKey;
  const fallbackSymbol = getPrimarySymbol(chainKey);

  const availableTokens = useMemo(
    () => getTokensForChain(chainKey),
    [chainKey, getTokensForChain]
  );

  const defaultToken =
    availableTokens.length > 0 ? availableTokens[0] : undefined;
  const selectedToken = selectedTokenId
    ? (getTokenById(selectedTokenId) ?? defaultToken)
    : defaultToken;

  const selectedTokenChainConfig = selectedToken?.chains[chainKey];
  const caipPrefix = CAIP_PREFIX_MAP[chainKey];
  const symbol = selectedToken?.symbol ?? fallbackSymbol;
  const decimals = selectedToken?.decimals ?? 18;

  const caip10WalletOrName =
    chainKey === "solana"
      ? ""
      : accountAddress && caipPrefix
        ? `${caipPrefix}:${accountAddress.toLowerCase()}`
        : "";

  const supportsWithdraw = Boolean(
    contractAddress && selectedTokenChainConfig && caip10WalletOrName
  );

  const parsedAmount = useMemo(() => {
    try {
      return parseUnits(amount || "0", decimals);
    } catch {
      return undefined;
    }
  }, [amount, decimals]);

  useEffect(() => {
    if (!open) return;
    const firstToken =
      availableTokens.length > 0 ? availableTokens[0] : undefined;
    if (!selectedToken && firstToken) {
      setSelectedTokenId(firstToken.id);
    }
  }, [open, availableTokens, selectedToken]);

  useEffect(() => {
    if (!open) return;
    setAmount(defaultAmount);
    setFormError(null);
  }, [open, defaultAmount]);

  const {
    data: tradeBalance,
    refetch: refetchTradeBalance,
    isFetching: balanceFetching,
  } = useTradeBalance({
    address: (contractAddress ?? ZERO_ADDRESS) as Address,
    caip10Wallet: caip10WalletOrName,
    caip10Token: selectedTokenChainConfig?.caip10Token,
    enabled: supportsWithdraw,
  });

  const availableBalance = tradeBalance ?? BigInt(0);
  const availableBalanceLabel = !supportsWithdraw
    ? "—"
    : balanceFetching
      ? "Fetching…"
      : `${formatUnits(availableBalance, decimals)} ${symbol}`;

  const action = chainKey === "solana" ? ACTION_OTHER_CHAIN : ACTION_NATIVE;

  const shortHash = (hash?: Hash) =>
    hash ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : undefined;

  const withdrawArgs = useMemo<TradingWithdrawArgs | undefined>(() => {
    if (!supportsWithdraw) return undefined;

    const caip10Token = selectedTokenChainConfig?.caip10Token?.trim();
    const caip10Wallet = caip10WalletOrName.trim();
    const amountToWithdraw = parsedAmount;

    if (!caip10Token || !caip10Wallet) return undefined;
    if (amountToWithdraw === undefined || amountToWithdraw <= BigInt(0)) {
      return undefined;
    }

    return {
      caip10Token,
      caip10WalletOrName: caip10Wallet,
      amount: amountToWithdraw,
      action,
    };
  }, [
    supportsWithdraw,
    selectedTokenChainConfig?.caip10Token,
    caip10WalletOrName,
    parsedAmount,
    action,
  ]);

  const {
    withdrawAsync,
    canWithdraw,
    simulation,
    isPending: writePending,
  } = useTradingWithdraw({
    address: (contractAddress ?? ZERO_ADDRESS) as Address,
    args: supportsWithdraw ? withdrawArgs : undefined,
  });

  const isSimulating = simulation.fetchStatus === "fetching";
  const simulationErrorMessage = simulation.error
    ? getErrorMessage(simulation.error)
    : null;

  const insufficientBalance =
    parsedAmount !== undefined && parsedAmount > availableBalance;

  const derivedErrorMessage = insufficientBalance
    ? "Insufficient balance for this withdrawal."
    : null;

  const canSubmit =
    Boolean(withdrawArgs) &&
    canWithdraw &&
    !insufficientBalance &&
    !balanceFetching;

  const handleSubmit = async () => {
    if (!supportsWithdraw) {
      setFormError("Withdrawals are unsupported for this chain.");
      return;
    }

    if (!withdrawArgs || !canSubmit) {
      const message =
        simulationErrorMessage ??
        derivedErrorMessage ??
        "Enter a valid amount to withdraw.";
      setFormError(message);
      return;
    }

    try {
      setFormError(null);
      const hash = await withdrawAsync();
      const formattedHash = shortHash(hash);
      setPendingTxHash(hash);
      onActivityEvent?.({
        action: "withdraw",
        status: "pending",
        amount,
        symbol,
        chainLabel,
        message: `Awaiting confirmation • ${formattedHash}`,
        hash,
      });
      toast({
        variant: "info",
        title: "Withdrawal submitted",
        description: `Awaiting confirmation for ${amount} ${symbol} on ${chainLabel}.`,
      });
      try {
        if (publicClient) {
          await publicClient.waitForTransactionReceipt({
            hash,
            confirmations: 1,
          });
        }
        toast({
          variant: "success",
          title: "Withdrawal confirmed",
          description: `${amount} ${symbol} withdrawn on ${chainLabel}.`,
        });
        onActivityEvent?.({
          action: "withdraw",
          status: "success",
          amount,
          symbol,
          chainLabel,
          message: `Confirmed • ${formattedHash}`,
          hash,
        });
        setOpen(false);
        setPendingTxHash(undefined);
        void refetchTradeBalance();
      } catch (waitError) {
        const message = getErrorMessage(waitError);
        setFormError(message);
        toast({
          variant: "error",
          title: "Withdrawal failed",
          description: message,
        });
        onActivityEvent?.({
          action: "withdraw",
          status: "error",
          amount,
          symbol,
          chainLabel,
          message,
          hash,
        });
        setPendingTxHash(undefined);
      }
      return hash;
    } catch (error) {
      const message = getErrorMessage(error);
      setFormError(message);
      toast({
        variant: "error",
        title: "Withdrawal failed",
        description: message,
      });
      onActivityEvent?.({
        action: "withdraw",
        status: "error",
        amount,
        symbol,
        chainLabel,
        message,
      });
      setPendingTxHash(undefined);
    }
  };

  const handleMax = () => {
    setAmount(formatUnits(availableBalance, decimals));
    setFormError(null);
  };

  const triggerElement = trigger({
    open: () => setOpen(true),
    isProcessing:
      Boolean(writePending) ||
      Boolean(pendingTxHash) ||
      (open && isSimulating),
  });

  return (
    <>
      {triggerElement}
      <WithdrawModal
        open={open}
        onClose={() => setOpen(false)}
        amount={amount}
        onAmountChange={(value) => {
          setAmount(value);
          setFormError(null);
        }}
        onSubmit={handleSubmit}
        chainLabel={chainLabel}
        symbol={symbol}
        tokenOptions={availableTokens.map((token) => {
          const chainDetails = token.chains[chainKey];
          return {
            id: token.id,
            label: token.name,
            symbol: token.symbol,
            address: chainDetails?.tokenAddress,
          };
        })}
        selectedTokenId={selectedToken?.id}
        onSelectToken={(id) => {
          setSelectedTokenId(id);
          setFormError(null);
        }}
        availableBalanceLabel={availableBalanceLabel}
        onRequestMax={handleMax}
        canWithdraw={canSubmit}
        isSubmitting={Boolean(writePending) || Boolean(pendingTxHash)}
        isSimulating={isSimulating}
        errorMessage={
          formError ?? simulationErrorMessage ?? derivedErrorMessage
        }
        infoMessage={
          !accountAddress && chainKey !== "solana"
            ? "Connect a wallet to populate withdrawal details."
            : chainKey === "solana"
              ? "Solana withdrawals require manual setup."
              : null
        }
      />
    </>
  );
}
