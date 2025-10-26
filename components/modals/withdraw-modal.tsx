"use client";

import { Loader2 } from "lucide-react";

import { SimpleModal } from "@/components/modals/simple-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TokenOption = {
  id: string;
  label: string;
  symbol: string;
  address?: string;
};

type WithdrawModalProps = {
  open: boolean;
  onClose: () => void;
  amount: string;
  onAmountChange: (value: string) => void;
  onSubmit: () => void;
  chainLabel: string;
  symbol: string;
  tokenOptions: TokenOption[];
  selectedTokenId?: string;
  onSelectToken: (id: string) => void;
  availableBalanceLabel: string;
  onRequestMax: () => void;
  canWithdraw: boolean;
  isSubmitting: boolean;
  isSimulating: boolean;
  errorMessage?: string | null;
  infoMessage?: string | null;
};

export function WithdrawModal({
  open,
  onClose,
  amount,
  onAmountChange,
  onSubmit,
  chainLabel,
  symbol,
  tokenOptions,
  selectedTokenId,
  onSelectToken,
  availableBalanceLabel,
  onRequestMax,
  canWithdraw,
  isSubmitting,
  isSimulating,
  errorMessage,
  infoMessage,
}: WithdrawModalProps) {
  const submitDisabled = !canWithdraw || isSubmitting || isSimulating;

  return (
    <SimpleModal
      open={open}
      title="Withdraw funds"
      description={`Move assets back to your wallet on ${chainLabel}.`}
      onClose={onClose}
      closeLabel="Cancel"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="withdraw-token" className="text-xs text-white/60">
            Asset
          </Label>
          <div className="relative">
            <select
              id="withdraw-token"
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

        <div className="space-y-2">
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
            id="withdraw-amount"
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
            placeholder="0.00"
            inputMode="decimal"
            className="rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
          />
          <p className="text-xs text-white/40">
            Available: {availableBalanceLabel}
          </p>
        </div>
        {/* 
        {infoMessage ? (
          <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
            {infoMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="text-xs text-red-400">{errorMessage}</p>
        ) : null} */}

        <Button
          onClick={onSubmit}
          disabled={submitDisabled}
          className="w-full rounded-xl -mt-4 bg-[#22c55e] text-white hover:bg-[#16a34a] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Submitting withdrawal…</span>
            </span>
          ) : (
            <>Withdraw {symbol}</>
          )}
        </Button>

        {/* {isSimulating ? (
          <p className="text-center text-[0.75rem] text-white/60">
            Preparing withdrawal details…
          </p>
        ) : null} */}
      </div>
    </SimpleModal>
  );
}
