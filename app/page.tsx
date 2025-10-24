"use client";

import {
  ArrowDownToLine,
  ArrowUpToLine,
  Loader2,
  Search,
  ShieldCheck,
  Wallet2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  SwapErrorContent,
  SwapSendingContent,
  SwapSuccessContent,
  TransferErrorContent,
  TransferPendingContent,
  TransferSuccessContent,
} from "@/app/components/dashboard/dynamic-island-content";
import {
  MarketOverviewCard,
  type ChartInterval,
} from "@/app/components/dashboard/market-overview";
import { PortfolioCard } from "@/app/components/dashboard/portfolio-card";
import { SwapPanel } from "@/app/components/dashboard/swap-panel";
import { TokenSelectorModal } from "@/app/components/dashboard/token-selector-modal";
import {
  ChainAvatar,
  getPrimarySymbol,
} from "@/components/dashboard/chain-avatar";
import {
  DepositFlow,
  type DepositFlowActivityEvent,
} from "@/components/dashboard/deposit-flow";
import {
  WithdrawFlow,
  type WithdrawFlowActivityEvent,
} from "@/components/dashboard/withdraw-flow";
import { ChainModal } from "@/components/modals/chain-modal";
import { SimpleModal } from "@/components/modals/simple-modal";
import DynamicIsland from "@/components/smoothui/ui/DynamicIsland";
import { Button } from "@/components/ui/button";
import { FloatingDock } from "@/components/ui/floating-dock";
import { useToast } from "@/components/ui/toast-provider";
import { useChainSwitcher } from "@/hooks/useChainSwitcher";
import { getErrorMessage } from "@/lib/errors";
import { TOKENS, type Token } from "@/lib/tokens";
import { LoginButton } from "./components/login-button";

const CHART_INTERVALS: ChartInterval[] = ["1H", "4H", "1D", "1W"];

type ActivityStatus = "pending" | "success" | "error";

type IslandEvent =
  | { kind: "idle" }
  | {
      kind: "swap";
      status: ActivityStatus;
      amount: string;
      fromToken: Token;
      toToken: Token;
      message?: string;
    }
  | {
      kind: "deposit";
      status: ActivityStatus;
      action: "approval" | "deposit";
      amount: string;
      symbol: string;
      chainLabel: string;
      message?: string;
      hash?: string;
    }
  | {
      kind: "withdraw";
      status: ActivityStatus;
      amount: string;
      symbol: string;
      chainLabel: string;
      message?: string;
      hash?: string;
    };

const ISLAND_RESET_DELAY = 3500;

const getIslandView = (
  event: IslandEvent
): "idle" | "ring" | "timer" | "notification" => {
  if (event.kind === "idle") return "idle";
  if (event.status === "pending") return "ring";
  if (event.status === "success") return "timer";
  return "notification";
};

const formatHash = (hash?: string) =>
  hash ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : undefined;

export default function Home() {
  const { toast } = useToast();

  const [activeInterval, setActiveInterval] = useState<ChartInterval>("1D");
  const [islandEvent, setIslandEvent] = useState<IslandEvent>({ kind: "idle" });
  const [fromToken, setFromToken] = useState<Token>(TOKENS[1]);
  const [toToken, setToToken] = useState<Token>(TOKENS[2]);
  const [amount, setAmount] = useState<string>("1.320");
  const [walletBalance, setWalletBalance] = useState<number>(128.45);
  const [tokenModal, setTokenModal] = useState<"from" | "to" | null>(null);
  const [chainModalOpen, setChainModalOpen] = useState<boolean>(false);
  const [portfolioModalOpen, setPortfolioModalOpen] = useState<boolean>(false);
  const {
    chainOptions,
    selectedChainKey,
    pendingChainKey,
    isSwitching,
    selectChain,
  } = useChainSwitcher({
    onSolanaSelected: () => {
      setChainModalOpen(false);
      toast({
        variant: "info",
        title: "Solana selected",
        description:
          "Solana flows use Privy directly. Approve the network in your Solana wallet to continue.",
      });
    },
    onSwitchSuccess: (option, data) => {
      setChainModalOpen(false);
      const symbol =
        data?.nativeCurrency?.symbol ?? getPrimarySymbol(option.key);
      toast({
        variant: "success",
        title: `Switched to ${option.name}`,
        description: `${symbol} balance will be used for the next swaps.`,
      });
    },
    onSwitchError: (error) => {
      toast({
        variant: "error",
        title: "Network switch failed",
        description: getErrorMessage(error),
      });
    },
  });
  const defaultWithdrawAmount = "0.25";

  const islandResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const swapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const withdrawOpenRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (islandResetTimeoutRef.current) {
        clearTimeout(islandResetTimeoutRef.current);
        islandResetTimeoutRef.current = null;
      }
      if (swapTimeoutRef.current) {
        clearTimeout(swapTimeoutRef.current);
        swapTimeoutRef.current = null;
      }
    };
  }, []);

  const showIslandEvent = useCallback((event: IslandEvent) => {
    if (islandResetTimeoutRef.current) {
      clearTimeout(islandResetTimeoutRef.current);
      islandResetTimeoutRef.current = null;
    }
    setIslandEvent(event);
    if (event.kind !== "idle" && event.status !== "pending") {
      islandResetTimeoutRef.current = setTimeout(() => {
        setIslandEvent({ kind: "idle" });
        islandResetTimeoutRef.current = null;
      }, ISLAND_RESET_DELAY);
    }
  }, []);

  const resetIsland = useCallback(() => {
    showIslandEvent({ kind: "idle" });
  }, [showIslandEvent]);

  const handleDepositActivity = useCallback(
    (activity: DepositFlowActivityEvent) => {
      showIslandEvent({
        kind: "deposit",
        status: activity.status,
        action: activity.action,
        amount: activity.amount,
        symbol: activity.symbol,
        chainLabel: activity.chainLabel,
        message: activity.message,
        hash: activity.hash,
      });
    },
    [showIslandEvent]
  );

  const handleWithdrawActivity = useCallback(
    (activity: WithdrawFlowActivityEvent) => {
      showIslandEvent({
        kind: "withdraw",
        status: activity.status,
        amount: activity.amount,
        symbol: activity.symbol,
        chainLabel: activity.chainLabel,
        message: activity.message,
        hash: activity.hash,
      });
    },
    [showIslandEvent],
  );

  const WithdrawFlowBridge = ({
    open,
    isProcessing,
  }: {
    open: () => void;
    isProcessing: boolean;
  }) => {
    useEffect(() => {
      withdrawOpenRef.current = open;
      return () => {
        if (withdrawOpenRef.current === open) {
          withdrawOpenRef.current = null;
        }
      };
    }, [open, isProcessing]);
    return null;
  };

  const formattedBalance = useMemo(
    () =>
      Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
        walletBalance
      ),
    [walletBalance]
  );

  const quotedAmount = useMemo(() => {
    const numericAmount = parseFloat(amount || "0");
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return "0.0000";
    }
    return (numericAmount * (fromToken.price / toToken.price)).toFixed(4);
  }, [amount, fromToken.price, toToken.price]);

  const handleSwap = useCallback(() => {
    const swapAmount = parseFloat(amount);
    if (Number.isNaN(swapAmount) || swapAmount <= 0) {
      toast({
        variant: "error",
        title: "Enter a valid amount",
        description: "Please set a positive amount before swapping.",
      });
      return;
    }

    const fromTokenSnapshot = fromToken;
    const toTokenSnapshot = toToken;
    const amountLabel = amount;

    showIslandEvent({
      kind: "swap",
      status: "pending",
      amount: amountLabel,
      fromToken: fromTokenSnapshot,
      toToken: toTokenSnapshot,
    });
    toast({
      variant: "info",
      title: "Swap started",
      description: `Swapping ${swapAmount} ${fromTokenSnapshot.symbol} for ${toTokenSnapshot.symbol}.`,
    });

    if (swapTimeoutRef.current) {
      clearTimeout(swapTimeoutRef.current);
    }

    swapTimeoutRef.current = setTimeout(() => {
      const didSucceed = Math.random() > 0.25;
      if (didSucceed) {
        setWalletBalance(
          (prev) =>
            Math.max(prev - swapAmount * fromTokenSnapshot.price, 0) +
            swapAmount * toTokenSnapshot.price
        );
        showIslandEvent({
          kind: "swap",
          status: "success",
          amount: amountLabel,
          fromToken: fromTokenSnapshot,
          toToken: toTokenSnapshot,
          message: `${swapAmount} ${fromTokenSnapshot.symbol} → ${toTokenSnapshot.symbol} executed successfully.`,
        });
        toast({
          variant: "success",
          title: "Swap confirmed",
          description: `${swapAmount} ${fromTokenSnapshot.symbol} → ${toTokenSnapshot.symbol} executed successfully.`,
        });
      } else {
        showIslandEvent({
          kind: "swap",
          status: "error",
          amount: amountLabel,
          fromToken: fromTokenSnapshot,
          toToken: toTokenSnapshot,
          message: "A network error occurred. Please retry in a moment.",
        });
        toast({
          variant: "error",
          title: "Swap failed",
          description: "A network error occurred. Please retry in a moment.",
        });
      }

      swapTimeoutRef.current = null;
    }, 2200);
  }, [amount, fromToken, showIslandEvent, toast, toToken]);

  const swapSummary = useMemo(
    () => ({
      executionPrice: (fromToken.price / toToken.price).toFixed(4),
      networkFee: "$0.74",
      slippage: "0.5%",
    }),
    [fromToken.price, toToken.price]
  );

  const islandIdleContent = (
    <div className="flex items-center gap-3 px-5 py-3 text-white">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
        <Wallet2 className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-white/60">
          Wallet balance
        </p>
        <p className="text-lg font-semibold">{formattedBalance}</p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <DepositFlow
          chainKey={selectedChainKey}
          defaultAmount="0.25"
          onActivityEvent={handleDepositActivity}
          trigger={({ open, isProcessing }) => (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-full bg-white/10 px-3 text-xs text-white hover:bg-white/20"
              onClick={open}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Deposit"
              )}
            </Button>
          )}
        />

        <LoginButton />
      </div>
    </div>
  );

  const islandRingContent = useMemo(() => {
    if (islandEvent.kind === "swap" && islandEvent.status === "pending") {
      return (
        <SwapSendingContent
          from={islandEvent.fromToken}
          to={islandEvent.toToken}
          amount={islandEvent.amount}
        />
      );
    }
    if (islandEvent.kind === "deposit" && islandEvent.status === "pending") {
      const title =
        islandEvent.action === "approval" ? "Approval pending" : "Depositing";
      return (
        <TransferPendingContent
          title={title}
          subtitle={
            islandEvent.message ??
            `${islandEvent.amount} ${islandEvent.symbol} • ${islandEvent.chainLabel}`
          }
          icon={
            islandEvent.action === "approval" ? (
              <ShieldCheck className="h-4 w-4 text-indigo-200" />
            ) : (
              <ArrowUpToLine className="h-4 w-4 text-blue-200" />
            )
          }
          iconBgClass={
            islandEvent.action === "approval"
              ? "bg-indigo-500/20"
              : "bg-blue-500/20"
          }
        />
      );
    }
    if (islandEvent.kind === "withdraw" && islandEvent.status === "pending") {
      return (
        <TransferPendingContent
          title="Withdrawal pending"
          subtitle={
            islandEvent.message ??
            `${islandEvent.amount} ${islandEvent.symbol} • ${islandEvent.chainLabel}`
          }
          icon={<ArrowDownToLine className="h-4 w-4 text-amber-200" />}
          iconBgClass="bg-amber-500/20"
        />
      );
    }
    return null;
  }, [islandEvent]);

  const islandTimerContent = useMemo(() => {
    if (islandEvent.kind === "swap" && islandEvent.status === "success") {
      return (
        <SwapSuccessContent
          from={islandEvent.fromToken}
          to={islandEvent.toToken}
          amount={islandEvent.amount}
          onDismiss={resetIsland}
        />
      );
    }
    if (islandEvent.kind === "deposit" && islandEvent.status === "success") {
      const title =
        islandEvent.action === "approval"
          ? "Approval completed"
          : "Deposit confirmed";
      const subtitle =
        islandEvent.message ??
        `${islandEvent.amount} ${islandEvent.symbol} • ${islandEvent.chainLabel}`;
      return (
        <TransferSuccessContent
          title={title}
          subtitle={subtitle}
          hash={formatHash(islandEvent.hash)}
        />
      );
    }
    if (islandEvent.kind === "withdraw" && islandEvent.status === "success") {
      const subtitle =
        islandEvent.message ??
        `${islandEvent.amount} ${islandEvent.symbol} • ${islandEvent.chainLabel}`;
      return (
        <TransferSuccessContent
          title="Withdrawal confirmed"
          subtitle={subtitle}
          hash={formatHash(islandEvent.hash)}
        />
      );
    }
    return null;
  }, [islandEvent, resetIsland]);

  const islandNotificationContent = useMemo(() => {
    if (islandEvent.kind === "swap" && islandEvent.status === "error") {
      return (
        <SwapErrorContent
          onRetry={handleSwap}
          message={
            islandEvent.message ?? "Please review your gas limit and try again."
          }
        />
      );
    }
    if (islandEvent.kind === "deposit" && islandEvent.status === "error") {
      const title =
        islandEvent.action === "approval"
          ? "Approval failed"
          : "Deposit failed";
      const subtitle =
        islandEvent.message ?? "Please review the transaction and try again.";
      return <TransferErrorContent title={title} subtitle={subtitle} />;
    }
    if (islandEvent.kind === "withdraw" && islandEvent.status === "error") {
      const subtitle =
        islandEvent.message ?? "Please review the transaction and try again.";
      return (
        <TransferErrorContent title="Withdrawal failed" subtitle={subtitle} />
      );
    }
    return null;
  }, [handleSwap, islandEvent]);

  return (
    <div className="relative min-h-screen bg-[#050608] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(10,20,40,0.4),_transparent_60%)]" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col  px-6 pb-32 pt-12 md:pt-0 md:-mt-8  ">
        <section className="flex justify-center">
          <DynamicIsland
            className="w-full max-w-lg"
            view={getIslandView(islandEvent)}
            idleContent={islandIdleContent}
            ringContent={islandRingContent}
            timerContent={islandTimerContent}
            notificationContent={islandNotificationContent}
          />
        </section>

        <section className="grid gap-6 -mt-4 lg:grid-cols-[1.6fr_1fr]">
          <MarketOverviewCard
            activeInterval={activeInterval}
            intervals={CHART_INTERVALS}
            onIntervalChange={(interval) => setActiveInterval(interval)}
          />
          <SwapPanel
            fromToken={fromToken}
            toToken={toToken}
            amount={amount}
            toAmount={quotedAmount}
            onAmountChange={setAmount}
            onSwap={handleSwap}
            onSelectToken={(side) => setTokenModal(side)}
            onSwitchTokens={() => {
              setFromToken(toToken);
              setToToken(fromToken);
            }}
            summary={swapSummary}
          />
        </section>

        <section className="mt-8 lg:max-w-md">
          <PortfolioCard tokens={TOKENS} />
        </section>
      </main>

      <WithdrawFlow
        chainKey={selectedChainKey}
        defaultAmount={defaultWithdrawAmount}
        onActivityEvent={handleWithdrawActivity}
        trigger={(props) => <WithdrawFlowBridge {...props} />}
      />

      <FloatingDock
        desktopClassName="fixed bottom-8 left-1/2 z-40 -translate-x-1/2 border border-white/10 bg-black/60 backdrop-blur"
        mobileClassName="fixed bottom-6 left-1/2 z-40 -translate-x-1/2"
        items={[
          {
            title: "Portfolio",
            icon: <Wallet2 className="h-5 w-5 text-white" />,
            onClick: () => setPortfolioModalOpen(true),
          },
          {
            title: "Token search",
            icon: <Search className="h-5 w-5 text-white" />,
            onClick: () => setTokenModal("from"),
          },
          {
            title: "Chains",
            icon: (
              <ChainAvatar
                chain={selectedChainKey}
                className="h-full w-full text-[0.6rem]"
              />
            ),
            onClick: () => setChainModalOpen(true),
          },
          {
            title: "Withdraw",
            icon: <ArrowDownToLine className="h-5 w-5 text-white" />,
            onClick: () => withdrawOpenRef.current?.(),
          },
        ]}
      />

      <TokenSelectorModal
        open={tokenModal !== null}
        onClose={() => setTokenModal(null)}
        onSelect={(token) => {
          if (!tokenModal) return;
          if (tokenModal === "from") {
            setFromToken(token);
          } else {
            setToToken(token);
          }
          setTokenModal(null);
        }}
        activeToken={tokenModal === "from" ? fromToken : toToken}
      />

      <ChainModal
        open={chainModalOpen}
        options={chainOptions}
        pendingChainKey={pendingChainKey}
        isSwitching={isSwitching}
        onSelect={selectChain}
        onClose={() => setChainModalOpen(false)}
      />

      <SimpleModal
        open={portfolioModalOpen}
        title="Portfolio summary"
        description="Overview of your unified balance."
        onClose={() => setPortfolioModalOpen(false)}
      >
        <div className="space-y-4 text-sm text-white/80">
          <DetailRow label="Total balance" value={formattedBalance} />
          <DetailRow label="Available to swap" value={formattedBalance} />
          <DetailRow label="Rewards this week" value="45.2 OP" />
          <Button
            onClick={() => setPortfolioModalOpen(false)}
            className="w-full rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8]"
          >
            Close
          </Button>
        </div>
      </SimpleModal>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/50">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
