/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from "zustand";
import { ChannelType, type ChannelUnread, type ChannelUnreadPayload } from "../types/channel.type";
import { useChannelStore } from "./channelStore";
import { useUserStore } from "./userStore";

type UnreadStoreType = {
  loadDataUnreadChannel: (data: ChannelUnread[]) => void;
  markUnread: (payload: ChannelUnreadPayload) => void;
  markReadOptimistic: (channelId: string) => void;
  byChannelId: Map<string, ChannelUnread>;
  countUnreadWorkspace: Map<string, number>;
  countUnreadChannelDM: number;
};

/**
 * 1 workspace có nhiều channel
 * lưu thông tin unread của từng channel trong workspace đó
 * byChannelId: {
 *  [1]: {
 *    workspaceId: 1,
 *    latestMessageId: 1,
 *    count: 2
 *    type: "workspace"
 *  },
 *  [2]: {
 *    workspaceId: 1,
 *    latestMessageId: 2,
 *    count: 3
 *    type: "workspace"
 *  },
 *  [3]: {
 *    workspaceId: null,
 *    latestMessageId: 3,
 *    count: 5
 *    type: "dm"
 *  }
 * }
 */

function getCountUnreadChannelDM(data: Map<string, ChannelUnread>) {
  let count = 0;
  for (const value of data.values()) {
    if (value.type === ChannelType.DM && value.workspaceId === null) {
      count += value.count;
    }
  }
  return count;
}

function getCountUnreadWorkspace(data: Map<string, ChannelUnread>) {
  const countMap = new Map<string, number>();
  for (const value of data.values()) {
    if (value.type !== ChannelType.DM && value.workspaceId !== null) {
      const currentCount = countMap.get(value.workspaceId) || 0;
      countMap.set(value.workspaceId, currentCount + value.count);
    }
  }
  return countMap;
}

export const useUnreadStore = create<UnreadStoreType>((set) => ({
  byChannelId: new Map<string, ChannelUnread>(),
  countUnreadWorkspace: new Map<string, number>(), // tính dụa trên các channel thuộc về workspace đó
  countUnreadChannelDM: 0,

  loadDataUnreadChannel: (data: ChannelUnread[]) => {
    const map = new Map<string, ChannelUnread>();
    data.forEach((item) => {
      map.set(item.channelId, item);
    });

    set(() => ({
      byChannelId: map,
      countUnreadChannelDM: getCountUnreadChannelDM(map),
      countUnreadWorkspace: getCountUnreadWorkspace(map),
    }));
  },

  markUnread: (payload: ChannelUnreadPayload) => {
    const currentOpenId = useChannelStore.getState().channelId;
    const currentUserId = useUserStore.getState().user?.id;
    if (payload.channelId === currentOpenId) return; // đang xem -> bỏ
    if (payload.senderId === currentUserId) return; // tự gửi -> bỏ

    set((state) => {
      const prev = state.byChannelId.get(payload.channelId);
      if (prev?.lastMessageId === payload.lastMessageId) return state; // dedup
      const { senderId: _senderId, ...rest } = payload;
      const next = new Map(state.byChannelId);
      next.set(payload.channelId, { unread: true, ...prev, ...rest });
      return {
        byChannelId: next,
        countUnreadChannelDM: getCountUnreadChannelDM(next),
        countUnreadWorkspace: getCountUnreadWorkspace(next),
      };
    });
  },

  markReadOptimistic: (channelId: string) => {
    set((state) => {
      if (!state.byChannelId.has(channelId)) return state;
      const next = new Map(state.byChannelId);
      next.delete(channelId);
      return {
        byChannelId: next,
        countUnreadChannelDM: getCountUnreadChannelDM(next),
        countUnreadWorkspace: getCountUnreadWorkspace(next),
      };
    });
  },
}));
