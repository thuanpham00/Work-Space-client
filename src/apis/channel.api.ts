import type {
  Channel,
  ChannelBody,
  ChannelConfig,
  ChannelDM,
  ChannelNicknamesBody,
  ChannelSettingsBody,
} from "../types/channel.type";
import type { Media } from "../types/media.type";
import type { QueryBase } from "../types/query.type";
import type { SuccessResponse } from "../types/utils.type";
import Http from "../utils/http";

export const channelApi = {
  getChannelDetail: (channelId: string) => {
    return Http.get<SuccessResponse<{ channel: Channel }>>(`/channels/${channelId}`);
  },

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

  create: (data: ChannelBody) => {
    return Http.post<SuccessResponse<{ channel: Channel }>>("/channels", data);
  },

  upload: (channelId: string, file: FormData) => {
    return Http.post<SuccessResponse<Media>>(`/channels/${channelId}/upload`, file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateSettings: (channelId: string, data: ChannelSettingsBody) => {
    return Http.patch<SuccessResponse<{ channel: ChannelConfig }>>(`/channels/${channelId}/settings`, data);
  },

  updateNicknames: (channelId: string, data: ChannelNicknamesBody) => {
    return Http.patch<SuccessResponse<{ nicknames: Record<string, string> }>>(
      `/channels/${channelId}/nicknames`,
      data,
    );
  },
};
