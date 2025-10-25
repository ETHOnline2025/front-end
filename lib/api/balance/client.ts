import { fetchWithError } from "../shared/errors";
import type { WithdrawData, WithdrawResponse } from "../types";

export const balanceApi = {
  // POST /api/balance/withdraw - Withdraw balance
  withdraw: async (withdrawData: WithdrawData): Promise<WithdrawResponse> => {
    const response = await fetchWithError<WithdrawResponse>(
      "/api/balance/withdraw",
      {
        method: "POST",
        body: JSON.stringify(withdrawData),
      }
    );
    return response;
  },
};
