import { create } from "zustand";

export type ChannelUnread = {
  workspaceId: string;
  latestMessageId: number;
};

export type ChannelUnreadPayload = {
  channelId: string;
  workspaceId: string;
  latestMessageId: number;
};

type UnreadStoreType = {
  byChannelId: Record<string, ChannelUnread>;
  markUnread: (payload: ChannelUnreadPayload) => void;
  markRead: (channelId: string) => void;
  isUnread: (channelId: string) => boolean;
  hasWorkspaceUnread: (workspaceId: string) => boolean;
};

/**
 * 1 workspace có nhiều channel
 * lưu thông tin unread của từng channel trong workspace đó
 * byChannelId: {
 *  [1]: {
 *    workspaceId: 1,
 *    latestMessageId: 1,
 *  },
 *  [2]: {
 *    workspaceId: 1,
 *    latestMessageId: 2,
 *  }
 * }
 */

export const useUnreadStore = create<UnreadStoreType>((set, get) => ({
  byChannelId: {},

  markUnread: (payload: ChannelUnreadPayload) => {
    set((state) => ({
      byChannelId: {
        ...state.byChannelId,
        [payload.channelId]: {
          workspaceId: String(payload.workspaceId),
          latestMessageId: Number(payload.latestMessageId),
        },
      },
    }));
  },

  markRead: (channelId: string) => {
    set((state) => {
      if (state.byChannelId[channelId]) return state;

      const next = { ...state.byChannelId };
      delete next[channelId]; // là toán tử dùng để xóa cặp key / value trong object
      return { byChannelId: next };
    });
  },

  isUnread: (channelId: string) => Boolean(get().byChannelId[channelId]),

  hasWorkspaceUnread: (workspaceId: string) => {
    return Boolean(Object.values(get().byChannelId).some((channel) => channel.workspaceId === workspaceId));
  },
}));
