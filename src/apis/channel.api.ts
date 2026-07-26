import type { ChannelDM } from "../types/channel.type";
import type { QueryBase } from "../types/query.type";
import type { SuccessResponse } from "../types/utils.type";
import Http from "../utils/http";

export const channelApi = {
  getDirectMessageChannelDetail: (userId: string) => {
    return Http.get<SuccessResponse<{ channel: ChannelDM; total: number }>>(
      `/channels/direct-messages/${userId}`,
    );
  },

  getMessagesChannel: (channelId: string, params: QueryBase) => {
    return Http.get<SuccessResponse<{ messages: any; total_page: number; page: number; limit: number }>>(
      `/channels/messages/${channelId}`,
      {
        params,
      },
    );
  },
};
