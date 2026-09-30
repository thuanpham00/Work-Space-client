import type { ChannelInvite } from "../types/channelInvite.type";
import type { SuccessResponse } from "../types/utils.type";
import Http from "../utils/http";

export const channelInviteApi = {
  getInvite: (token: string) => {
    return Http.get<SuccessResponse<ChannelInvite>>(`/channel-invites/${token}`);
  },
};
