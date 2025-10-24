import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import { TradingABI } from "./contracts/Trading";

export default defineConfig({
  out: "src/generated.ts",
  contracts: [
    {
      name: "Trading",
      abi: TradingABI.abi,
    },
  ],
  plugins: [react()],
});
