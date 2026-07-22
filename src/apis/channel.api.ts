import type { ChannelDM } from "../types/channel.type";
import type { SuccessResponse } from "../types/utils.type";
import Http from "../utils/http";

export const channelApi = {
  getDirectMessageChannels: () => {
    return Http.get<SuccessResponse<{ channels: ChannelDM[]; total: number }>>("/channels/direct-messages");
  },
};
