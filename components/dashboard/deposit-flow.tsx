"use client";

import { useEffect, useMemo, useState } from "react";
import {
  erc20Abi,
  formatUnits,
  getAddress,
  parseUnits,
  type Address,
  type Hash,
} from "viem";
import {
  useAccount,
  useBalance,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from "wagmi";

import { useTokensContext } from "@/app/providers/TokensProvider";
import type { ChainKey } from "@/components/dashboard/chain-avatar";
import { getPrimarySymbol } from "@/components/dashboard/chain-avatar";
import {
  DepositModal,
  type DepositFormState,
} from "@/components/modals/deposit-modal";
import { useToast } from "@/components/ui/toast-provider";
import { BASE_CHAIN_OPTIONS } from "@/hooks/useChainSwitcher";
import { useTradingDeposit, type TradingDepositArgs } from "@/hooks/useDeposit";
import { getTradingContractAddress } from "@/lib/contracts";
import { getErrorMessage } from "@/lib/errors";
import { CAIP_PREFIX_MAP } from "@/lib/tokens";

type ActivityStatus = "pending" | "success" | "error";

export type DepositFlowActivityEvent = {
  action: "approval" | "deposit";
  status: ActivityStatus;
  amount: string;
  symbol: string;
  chainLabel: string;
  message?: string;
  hash?: Hash;
};

type DepositFlowProps = {
  chainKey: ChainKey;
  trigger: (props: {
    open: () => void;
    isProcessing: boolean;
  }) => React.ReactNode;
  defaultAmount?: string;
  onActivityEvent?: (event: DepositFlowActivityEvent) => void;
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;
const ACTION_NATIVE = 0;
const ACTION_OTHER_CHAIN = 1;

const DEFAULT_FORM_STATE: DepositFormState = {
  amount: "0.00",
  caip10Token: "",
  caip10Wallet: "",
  depositorWallet: "",
};

export function DepositFlow({
  chainKey,
  trigger,
  defaultAmount = "0.25",
  onActivityEvent,
}: DepositFlowProps) {
  const { toast } = useToast();
  const { address: accountAddress } = useAccount();
  const publicClient = usePublicClient();
  const { getTokensForChain, getTokenById } = useTokensContext();
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState<DepositFormState>({
    ...DEFAULT_FORM_STATE,
    amount: defaultAmount,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string | undefined>(
    undefined
  );
  const [pendingTxHash, setPendingTxHash] = useState<Hash | undefined>(
    undefined
  );

  const contractAddress = getTradingContractAddress(chainKey);
  const chainMeta = BASE_CHAIN_OPTIONS.find(
    (option) => option.key === chainKey
  );
  const chainLabel = chainMeta?.name ?? chainKey;
  const symbol = getPrimarySymbol(chainKey);

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
  const tokenAddress = selectedTokenChainConfig?.tokenAddress;

  const decimals = 18;

  const caipPrefix = CAIP_PREFIX_MAP[chainKey];

  const parsedAmount = useMemo(() => {
    try {
      const raw = formState.amount || "0";
      const parsed = parseUnits(raw, decimals);
      return parsed;
    } catch {
      return undefined;
    }
  }, [formState.amount, decimals]);

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

    setFormState((prev) => {
      const defaultCaipWallet =
        accountAddress && caipPrefix && chainKey !== "solana"
          ? `${caipPrefix}:${accountAddress.toLowerCase()}`
          : prev.caip10Wallet;

      const defaultDepositor =
        chainKey === "solana"
          ? prev.depositorWallet || accountAddress || prev.depositorWallet
          : (accountAddress ?? prev.depositorWallet);

      return {
        ...prev,
        amount: defaultAmount,
        caip10Token: selectedTokenChainConfig?.caip10Token ?? prev.caip10Token,
        caip10Wallet:
          chainKey === "solana"
            ? prev.caip10Wallet || ""
            : (defaultCaipWallet ?? ""),
        depositorWallet: defaultDepositor ?? "",
      };
    });
    setFormError(null);
  }, [
    open,
    chainKey,
    accountAddress,
    defaultAmount,
    selectedTokenChainConfig?.caip10Token,
    caipPrefix,
  ]);

  const handleFieldChange = (field: keyof DepositFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const { data: balanceData } = useBalance({
    address: accountAddress,
    token:
      chainKey === "solana"
        ? undefined
        : selectedTokenChainConfig?.tokenAddress,
    query: {
      enabled:
        Boolean(accountAddress) &&
        chainKey !== "solana" &&
        Boolean(selectedTokenChainConfig),
    },
  });

  const walletBalanceLabel =
    chainKey === "solana"
      ? "Cross-chain credit"
      : balanceData
        ? `${formatUnits(balanceData.value, decimals)} ${selectedToken?.symbol ?? ""}`
        : "—";

  const handleMax = () => {
    if (!balanceData) return;
    const formatted = formatUnits(balanceData.value, decimals);
    setFormState((prev) => ({
      ...prev,
      amount: formatted,
    }));
  };

  const shortHash = (hash?: Hash) =>
    hash ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : undefined;

  const allowanceArgs =
    tokenAddress && accountAddress && contractAddress
      ? ([accountAddress, contractAddress] as const)
      : undefined;

  const {
    data: allowanceData,
    refetch: refetchAllowance,
    isPending: allowancePending,
  } = useReadContract({
    abi: erc20Abi,
    address: (tokenAddress ?? ZERO_ADDRESS) as Address,
    functionName: "allowance",
    args: allowanceArgs,
    query: {
      enabled: Boolean(allowanceArgs && tokenAddress),
    },
  });

  const handleApprove = async () => {
    if (
      !tokenAddress ||
      !contractAddress ||
      parsedAmount === undefined ||
      parsedAmount <= BigInt(0)
    ) {
      return;
    }

    const amountLabel = formState.amount;
    const symbolLabel = selectedToken?.symbol ?? symbol;

    try {
      setFormError(null);
      const hash = await approveAsync({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [contractAddress, parsedAmount],
      });
      const formattedHash = shortHash(hash);
      onActivityEvent?.({
        action: "approval",
        status: "pending",
        amount: amountLabel,
        symbol: symbolLabel,
        chainLabel,
        hash,
        message: `Awaiting confirmation • ${formattedHash}`,
      });
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      toast({
        variant: "success",
        title: "Approval confirmed",
        description: `Approved ${formState.amount} ${selectedToken?.symbol ?? symbol} for deposits.`,
      });
      onActivityEvent?.({
        action: "approval",
        status: "success",
        amount: amountLabel,
        symbol: symbolLabel,
        chainLabel,
        hash,
        message: `Approval confirmed • ${formattedHash}`,
      });
      await refetchAllowance();
      return hash;
    } catch (error) {
      const message = getErrorMessage(error);
      setFormError(message);
      toast({
        variant: "error",
        title: "Approval failed",
        description: message,
      });
      onActivityEvent?.({
        action: "approval",
        status: "error",
        amount: amountLabel,
        symbol: symbolLabel,
        chainLabel,
        message,
      });
    }
  };

  const action = chainKey === "solana" ? ACTION_OTHER_CHAIN : ACTION_NATIVE;

  const supportsDeposit =
    Boolean(contractAddress) && Boolean(selectedTokenChainConfig);

  const allowance = allowanceData ?? BigInt(0);
  const isAmountPositive =
    parsedAmount !== undefined && parsedAmount > BigInt(0);
  const requiresApproval = Boolean(
    tokenAddress && isAmountPositive && allowance < (parsedAmount ?? BigInt(0))
  );
  const canApprove = Boolean(
    tokenAddress &&
      accountAddress &&
      contractAddress &&
      isAmountPositive &&
      !allowancePending
  );

  const { writeContractAsync: approveAsync, isPending: approvePending } =
    useWriteContract();

  const depositArgs = useMemo<TradingDepositArgs | undefined>(() => {
    if (!supportsDeposit) return undefined;

    const caipToken = formState.caip10Token.trim();
    const caipWallet = formState.caip10Wallet.trim();
    if (!caipToken || !caipWallet) return undefined;

    let depositorWallet: Address;
    if (action === ACTION_OTHER_CHAIN) {
      const depositorRaw = formState.depositorWallet.trim();
      if (!depositorRaw) return undefined;
      try {
        depositorWallet = getAddress(depositorRaw);
      } catch {
        return undefined;
      }
    } else {
      depositorWallet = ZERO_ADDRESS;
    }

    const amount = parsedAmount;
    if (amount === undefined || amount <= BigInt(0)) return undefined;

    return {
      caip10Token: caipToken,
      caip10Wallet: caipWallet,
      amount,
      action,
      depositorWallet,
    };
  }, [
    supportsDeposit,
    formState.caip10Token,
    formState.caip10Wallet,
    formState.depositorWallet,
    action,
    parsedAmount,
  ]);

  const {
    depositAsync,
    canDeposit,
    simulation,
    isPending: writePending,
  } = useTradingDeposit({
    address: (contractAddress ?? ZERO_ADDRESS) as Address,
    args: supportsDeposit ? depositArgs : undefined,
  });

  const isSimulating = simulation.fetchStatus === "fetching";
  const simulationErrorMessage = simulation.error
    ? getErrorMessage(simulation.error)
    : null;

  const infoMessage =
    !accountAddress && chainKey !== "solana"
      ? "Connect a wallet to populate the CAIP-10 details automatically."
      : chainKey === "solana"
        ? "Credits the trading balance without transferring on-chain funds. Provide the EVM wallet that should receive the credit."
        : null;

  const handleSubmit = async () => {
    if (!supportsDeposit) {
      setFormError("Deposit unsupported for this chain.");
      return;
    }

    if (!depositArgs || !canDeposit) {
      const message =
        simulationErrorMessage ?? "Enter a valid amount and identifiers.";
      setFormError(message);
      return;
    }

    try {
      setFormError(null);
      const hash = await depositAsync();
      const formattedHash = shortHash(hash);
      setPendingTxHash(hash);
      onActivityEvent?.({
        action: "deposit",
        status: "pending",
        amount: formState.amount,
        symbol: selectedToken?.symbol ?? symbol,
        chainLabel,
        message: `Awaiting confirmation • ${formattedHash}`,
        hash,
      });
      toast({
        variant: "info",
        title: "Deposit submitted",
        description: `Awaiting confirmation for ${formState.amount} ${selectedToken?.symbol ?? symbol} on ${chainLabel}.`,
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
          title: "Deposit confirmed",
          description: `${formState.amount} ${selectedToken?.symbol ?? symbol} deposited on ${chainLabel}.`,
        });
        onActivityEvent?.({
          action: "deposit",
          status: "success",
          amount: formState.amount,
          symbol: selectedToken?.symbol ?? symbol,
          chainLabel,
          message: `Confirmed • ${formattedHash}`,
          hash,
        });
        setOpen(false);
        if (tokenAddress) {
          void refetchAllowance();
        }
      } catch (waitError) {
        const message = getErrorMessage(waitError);
        setFormError(message);
        toast({
          variant: "error",
          title: "Deposit failed",
          description: message,
        });
        onActivityEvent?.({
          action: "deposit",
          status: "error",
          amount: formState.amount,
          symbol: selectedToken?.symbol ?? symbol,
          chainLabel,
          message,
          hash,
        });
      } finally {
        setPendingTxHash(undefined);
      }
      return hash;
    } catch (error) {
      const message = getErrorMessage(error);
      setFormError(message);
      toast({
        variant: "error",
        title: "Deposit failed",
        description: message,
      });
      onActivityEvent?.({
        action: "deposit",
        status: "error",
        amount: formState.amount,
        symbol: selectedToken?.symbol ?? symbol,
        chainLabel,
        message,
      });
      setPendingTxHash(undefined);
    }
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
      <DepositModal
        open={open}
        onClose={() => setOpen(false)}
        form={formState}
        onChange={handleFieldChange}
        onSubmit={handleSubmit}
        chainLabel={chainLabel}
        contractAddress={contractAddress}
        symbol={selectedToken?.symbol ?? symbol}
        isSubmitting={Boolean(writePending) || Boolean(pendingTxHash)}
        isSimulating={isSimulating}
        canDeposit={Boolean(depositArgs) && canDeposit}
        supportsDeposit={supportsDeposit}
        errorMessage={formError ?? simulationErrorMessage}
        infoMessage={infoMessage}
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
          const nextToken =
            availableTokens.find((token) => token.id === id) ??
            getTokenById(id);
          const nextConfig = nextToken?.chains[chainKey];
          if (nextConfig) {
            setFormState((prev) => ({
              ...prev,
              caip10Token: nextConfig.caip10Token,
            }));
          }
        }}
        walletBalanceLabel={walletBalanceLabel}
        onRequestMax={handleMax}
        caip10WalletReadOnly={chainKey !== "solana"}
        showDepositorField={chainKey === "solana"}
        actionLabel={
          action === ACTION_NATIVE
            ? "Mode: Native transfer (requires on-chain tokens)."
            : "Mode: OTHER_CHAIN (credits balance without token transfer)."
        }
        requiresApproval={requiresApproval}
        onApprove={handleApprove}
        isApproving={approvePending}
        canApprove={canApprove}
      />
    </>
  );
}
