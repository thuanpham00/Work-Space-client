import { create } from "zustand";
import { TypeChannelUnread, type ChannelUnread } from "../types/channel.type";

type UnreadStoreType = {
  loadDataUnreadChannel: (data: ChannelUnread[]) => void;
  markUnread: (payload: ChannelUnread) => void;
  markRead: (channelId: string) => void;
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
    if (value.type === TypeChannelUnread.DM && value.workspaceId === null) {
      count += value.count;
    }
  }
  return count;
}

function getCountUnreadWorkspace(data: Map<string, ChannelUnread>) {
  const countMap = new Map<string, number>();
  for (const value of data.values()) {
    if (value.type !== TypeChannelUnread.DM && value.workspaceId !== null) {
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

  markUnread: (payload: ChannelUnread) => {
    set((state) => {
      const next = new Map(state.byChannelId);
      next.set(payload.channelId, payload);
      return {
        byChannelId: next,
      };
    });
  },

  markRead: (channelId: string) => {
    set((state) => {
      const next = new Map(state.byChannelId);
      next.delete(channelId);
      return {
        byChannelId: next,
      };
    });
  },
}));
