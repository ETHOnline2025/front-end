"use client";

import { Loader2 } from "lucide-react";

import { SimpleModal } from "@/components/modals/simple-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type DepositFormState = {
  amount: string;
  caip10Token: string;
  caip10Wallet: string;
  depositorWallet: string;
};

type DepositModalProps = {
  open: boolean;
  onClose: () => void;
  form: DepositFormState;
  onChange: (field: keyof DepositFormState, value: string) => void;
  onSubmit: () => void;
  chainLabel: string;
  contractAddress?: string;
  symbol: string;
  isSubmitting: boolean;
  isSimulating: boolean;
  canDeposit: boolean;
  supportsDeposit: boolean;
  errorMessage?: string | null;
  infoMessage?: string | null;
  tokenOptions: Array<{
    id: string;
    label: string;
    symbol: string;
    address?: string;
  }>;
  selectedTokenId?: string;
  onSelectToken: (id: string) => void;
  walletBalanceLabel?: string;
  onRequestMax: () => void;
  caip10WalletReadOnly?: boolean;
  showDepositorField: boolean;
  actionLabel: string;
  requiresApproval: boolean;
  onApprove: () => void;
  isApproving: boolean;
  canApprove: boolean;
};

export function DepositModal({
  open,
  onClose,
  form,
  onChange,
  onSubmit,
  chainLabel,
  contractAddress,
  symbol,
  isSubmitting,
  isSimulating,
  canDeposit,
  supportsDeposit,
  errorMessage,
  infoMessage,
  tokenOptions,
  selectedTokenId,
  onSelectToken,
  walletBalanceLabel,
  onRequestMax,
  caip10WalletReadOnly = false,
  showDepositorField,
  actionLabel,
  requiresApproval,
  onApprove,
  isApproving,
  canApprove,
}: DepositModalProps) {
  const showApproveAction = requiresApproval;
  const submitDisabled =
    !supportsDeposit || !canDeposit || isSubmitting || isSimulating;
  const approveDisabled = !canApprove || isApproving;
  const primaryDisabled = showApproveAction ? approveDisabled : submitDisabled;
  const primaryHandler = showApproveAction ? onApprove : onSubmit;

  return (
    <SimpleModal
      open={open}
      title="Deposit funds"
      description={`Route assets into the trading contract on ${chainLabel}.`}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="deposit-token" className="text-xs text-white/60">
            Asset
          </Label>
          <div className="relative">
            <select
              id="deposit-token"
              value={selectedTokenId ?? tokenOptions[0]?.id ?? ""}
              onChange={(event) => onSelectToken(event.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30 focus:ring-0"
            >
              {tokenOptions.map((option) => {
                const shortenedAddress =
                  option.address && option.address.length > 10
                    ? `${option.address.slice(0, 6)}...${option.address.slice(-4)}`
                    : option.address;
                const label = shortenedAddress
                  ? `${option.symbol} · ${option.label} (${shortenedAddress})`
                  : `${option.symbol} · ${option.label}`;
                return (
                  <option key={option.id} value={option.id}>
                    {label}
                  </option>
                );
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/40">
              ▾
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/50">
            <span>Amount</span>
            <button
              type="button"
              className="rounded-full px-2 py-1 text-[0.7rem] font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
              onClick={onRequestMax}
            >
              Max
            </button>
          </div>
          <Input
            id="deposit-amount"
            placeholder="0.00"
            inputMode="decimal"
            value={form.amount}
            onChange={(event) => onChange("amount", event.target.value)}
            className="rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
          />
          <p className="text-xs text-white/40">
            Available: {walletBalanceLabel ?? "—"}
          </p>
        </div>

        {/* {infoMessage ? (
          <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
            {infoMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="text-xs text-red-400">{errorMessage}</p>
        ) : null} */}

        <Button
          onClick={primaryHandler}
          disabled={primaryDisabled}
          className="w-full rounded-xl -mb-4 bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
        >
          {showApproveAction ? (
            isApproving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Approving…</span>
              </span>
            ) : (
              <>Approve {symbol}</>
            )
          ) : isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Submitting deposit…</span>
            </span>
          ) : (
            <>Deposit {symbol}</>
          )}
        </Button>

        {/* {isSimulating ? (
          <p className="text-center text-[0.75rem] text-white/60">
            Preparing transaction details…
          </p>
        ) : null} */}
      </div>
    </SimpleModal>
  );
}
