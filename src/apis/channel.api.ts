import type { FriendResponse } from "../types/friend.type";
import type { SuccessResponse } from "../types/utils.type";
import Http from "../utils/http";

export const channelApi = {
  getDirectMessageChannels: (params: { search: string }) => {
    return Http.get<SuccessResponse<{ channels: FriendResponse[]; total: number }>>("/channels/direct-messages", {
      params,
    });
  },
};
