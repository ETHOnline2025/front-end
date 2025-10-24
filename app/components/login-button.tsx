"use client";
import { Button } from "@/components/ui/button";
import { usePrivy, useWallets } from "@privy-io/react-auth";

export function LoginButton() {
  const { authenticated, login, logout } = usePrivy();

  const { wallets } = useWallets();
  if (!authenticated) {
    return (
      <Button
        size="sm"
        onClick={login}
        className="h-8 rounded-full bg-white px-3 text-xs font-semibold text-black hover:bg-white/90"
      >
        Connect
      </Button>
    );
  }

  const wallet = wallets[0];
  return (
    <Button
      size="sm"
      onClick={logout}
      className="h-8 rounded-full bg-white px-3 text-xs font-semibold text-black hover:bg-white/90"
    >
      {wallet
        ? `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}`
        : "Connect"}
    </Button>
  );
}
