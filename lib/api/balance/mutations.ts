import { useMutation, useQueryClient } from "@tanstack/react-query";
import { balanceApi } from "./client";

// Withdraw balance
export const useWithdraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: balanceApi.withdraw,
    onSuccess: (response) => {
      // You might want to invalidate balance or user data queries here
      // queryClient.invalidateQueries({ queryKey: queryKeys.balance });
      console.log("Withdrawal successful:", response);
    },
    onError: (error) => {
      console.error("Failed to withdraw:", error);
    },
  });
};
