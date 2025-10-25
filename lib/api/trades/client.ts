import { fetchWithError } from "../shared/errors";
import type { ApiResponse, Trade } from "../types";

export const tradesApi = {
  // GET /api/trades/ - Get all trades
  getTrades: async (): Promise<Trade[]> => {
    const response = await fetchWithError<ApiResponse<Trade[]>>("/api/trades/");
    return response.data;
  },
};
