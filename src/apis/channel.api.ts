import type { ChannelDM } from "../types/channel.type";
import type { SuccessResponse } from "../types/utils.type";
import Http from "../utils/http";

export const channelApi = {
  getDirectMessageChannelDetail: (userId: string) => {
    return Http.get<SuccessResponse<{ channel: ChannelDM; total: number }>>(
      `/channels/direct-messages/${userId}`,
    );
  },
};
