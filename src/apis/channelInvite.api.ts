import type { ChannelProfile } from "../types/channel.type";
import type { SuccessResponse } from "../types/utils.type";
import Http from "../utils/http";

export const channelInviteApi = {
  getInvite: (token: string) => {
    return Http.get<SuccessResponse<{ channel: ChannelProfile }>>(`/channel-invites/${token}`);
  },
};
