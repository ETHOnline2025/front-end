"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type SimpleModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  closeLabel?: string;
};

export function SimpleModal({
  open,
  title,
  description,
  children,
  onClose,
  closeLabel = "Close",
}: SimpleModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const overlay = (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(event) => event.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-black/80 p-6 text-white backdrop-blur"
          >
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">{title}</h2>
              {description ? (
                <p className="text-sm text-white/60">{description}</p>
              ) : null}
            </div>
            <div className="mt-5 space-y-4">{children}</div>
            <Button
              variant="ghost"
              className="mt-6 w-full rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
              onClick={onClose}
            >
              {closeLabel}
            </Button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return createPortal(overlay, document.body);
}
