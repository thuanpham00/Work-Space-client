import type { SuccessResponse } from "../types/utils.type";
import Http from "../utils/http";

export const socketApi = {
  syncRefreshToken: (refreshToken: string) => {
    return Http.post<SuccessResponse<{ message: string }>>(`/socket/sync-refresh-token`, { refreshToken });
  },
};
