/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Attachment } from "../types/attachment.type";
import type {
  Channel,
  ChannelBody,
  ChannelConfig,
  ChannelNicknamesBody,
  ChannelProfile,
  ChannelSettingsBody,
  ChannelUnread,
} from "../types/channel.type";
import type { Media } from "../types/media.type";
import type { Message } from "../types/message.type";
import type { QueryBase } from "../types/query.type";
import type { SuccessResponse } from "../types/utils.type";
import Http from "../utils/http";

export const channelApi = {
  getChannelDetail: (channelId: string) => {
    return Http.get<SuccessResponse<{ channel: Channel }>>(`/channels/${channelId}`);
  },

  getMessagesChannel: (channelId: string, params: QueryBase) => {
    return Http.get<
      SuccessResponse<{ messages: Message[]; total_page: number; page: number; limit: number }>
    >(`/channels/${channelId}/messages`, {
      params,
    });
  },

  getAttachmentsChannel: (channelId: string, params: QueryBase) => {
    return Http.get<
      SuccessResponse<{ attachments: Attachment[]; total_page: number; page: number; limit: number }>
    >(`/channels/${channelId}/attachments`, {
      params,
    });
  },

  getFriendsInviteChannel: (channelId: string, params: QueryBase) => {
    return Http.get<
      SuccessResponse<{ friends: any[]; total_page: number; page: number; limit: number; total: number }>
    >(`/channels/${channelId}/invite-friends`, {
      params,
    });
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

  update: (channelId: string, data: Partial<ChannelBody>) => {
    return Http.patch<SuccessResponse<{ channel: Channel }>>(`/channels/${channelId}`, data);
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

  unreadChannel: () => {
    return Http.get<SuccessResponse<{ unreadFriends: ChannelUnread[] }>>(`/channels/unread`);
  },

  infoChannelStatus: (channelId: string) => {
    return Http.get<SuccessResponse<{ channel: ChannelProfile }>>(`/channels/${channelId}/status`);
  },

  requestToJoin: (channelId: string) => {
    return Http.post<SuccessResponse<{ channel: ChannelProfile }>>(`/channels/${channelId}/request-join`);
  },

  cancelRequestToJoin: (channelId: string) => {
    return Http.delete<SuccessResponse<{ channel: ChannelProfile }>>(`/channels/${channelId}/request-join`);
  },
};
