"use client";

import { Loader2 } from "lucide-react";

import type { ChainKey } from "@/components/dashboard/chain-avatar";
import { ChainAvatar } from "@/components/dashboard/chain-avatar";
import { SimpleModal } from "@/components/modals/simple-modal";
import { Badge } from "@/components/ui/badge";
import type { ChainOption } from "@/hooks/useChainSwitcher";
import Image from "next/image";

type ChainModalProps = {
  open: boolean;
  options: ChainOption[];
  pendingChainKey: ChainKey | null;
  isSwitching: boolean;
  onSelect: (option: ChainOption) => void;
  onClose: () => void;
};

export function ChainModal({
  open,
  options,
  pendingChainKey,
  isSwitching,
  onSelect,
  onClose,
}: ChainModalProps) {
  return (
    <SimpleModal
      open={open}
      title="Select network"
      description="Pick a chain to route your next swap."
      onClose={onClose}
    >
      <div className="grid gap-3">
        {options.map((option) => {
          const isPending =
            pendingChainKey === option.key && Boolean(isSwitching);
          const isDisabled =
            isPending || (isSwitching && pendingChainKey !== option.key);
          const isActive = option.badge === "Active";

          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onSelect(option)}
              disabled={isDisabled}
              className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left text-sm transition ${
                isActive
                  ? "border-white/40 bg-white/15 text-white"
                  : "border-white/10 bg-white/5 text-white/90 hover:border-white/20 hover:bg-white/10"
              } ${isDisabled ? "opacity-80" : ""}`}
            >
              <div className="flex items-center gap-3">
                {option.chainIcon ? (
                  <Image
                    src={`/${option.chainIcon}.svg`}
                    alt={option.name}
                    width={40}
                    height={40}
                    className="h-10 w-10"
                  />
                ) : (
                  <ChainAvatar
                    chain={option.key}
                    className="h-10 w-10 text-xs"
                  />
                )}
                <div className="text-left">
                  <p className="font-semibold text-white">{option.name}</p>
                  <p className="text-xs text-white/60">{option.detail}</p>
                  {option.description ? (
                    <p className="mt-1 text-xs text-white/40">
                      {option.description}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white/70" />
                ) : null}
                {option.badge ? (
                  <Badge className="bg-white/10 text-white/80">
                    {option.badge}
                  </Badge>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </SimpleModal>
  );
}
