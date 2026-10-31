/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from "zustand";
import { ChannelType, type ChannelUnread, type ChannelUnreadPayload } from "../types/channel.type";
import { useChannelStore } from "./channelStore";
import { useUserStore } from "./userStore";

type UnreadStoreType = {
  loadDataUnreadChannel: (data: ChannelUnread[]) => void;
  markUnread: (payload: ChannelUnreadPayload) => void;
  markReadOptimistic: (channelId: string, messageId?: string | null) => void;
  byChannelId: Map<string, ChannelUnread>;
  countUnreadWorkspace: Map<string, number>;
  countUnreadChannelDM: number;

  lastReadMap: Map<string, string>;
};

/**
 * 1 workspace có nhiều channel
 * lưu thông tin unread của từng channel trong workspace đó
 * byChannelId: {
 *   [1]: {
 *     workspaceId: 1,
 *     latestMessageId: 1,
 *     count: 2,
 *     type: "workspace",
 *     unread: true,
 *     channelId: 1,
 *   },
 *   [2]: {
 *     workspaceId: 1,
 *     latestMessageId: 2,
 *     count: 3,
 *     type: "workspace",
 *     unread: true,
 *     channelId: 2,
 *   },
 *   [3]: {
 *     workspaceId: null,
 *     latestMessageId: 3,
 *     count: 5,
 *     type: "dm",
 *     unread: true,
 *     channelId: 3,
 *   }
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

/** So sánh 2 messageId (string) an toàn — trả về true nếu a <= b */
function isMessageIdLE(a: string, b: string): boolean {
  try {
    return BigInt(a) <= BigInt(b);
  } catch {
    return false;
  }
}

export const useUnreadStore = create<UnreadStoreType>((set) => ({
  byChannelId: new Map<string, ChannelUnread>(),
  countUnreadWorkspace: new Map<string, number>(), // tính dụa trên các channel thuộc về workspace đó
  countUnreadChannelDM: 0,
  lastReadMap: new Map<string, string>(),

  loadDataUnreadChannel: (data: ChannelUnread[]) => {
    const currentOpenId = useChannelStore.getState().channelId;

    const map = new Map<string, ChannelUnread>();
    data.forEach((item) => {
      if (item.channelId === currentOpenId) {
        map.set(item.channelId, { ...item, count: 0, unread: false }); // load lại channel đang mở
        return;
      }
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
    if (payload.channelId === currentOpenId) return; // đang mở channel đó -> bỏ ko cần tính
    if (payload.senderId === currentUserId) return; // tự gửi -> bỏ ko cần tính

    set((state) => {
      const prev = state.byChannelId.get(payload.channelId);
      if (prev?.lastMessageId === payload.lastMessageId) return state; // dedup

      const lastReadId = state.lastReadMap.get(payload.channelId);
      if (lastReadId && isMessageIdLE(payload.lastMessageId, lastReadId)) {
        return state;
      }

      const { senderId: _senderId, ...rest } = payload;
      const next = new Map(state.byChannelId);
      next.set(payload.channelId, { ...prev, ...rest, unread: true });

      return {
        byChannelId: next,
        countUnreadChannelDM: getCountUnreadChannelDM(next),
        countUnreadWorkspace: getCountUnreadWorkspace(next),
      };
    });
  },

  markReadOptimistic: (channelId: string, messageId?: string | null) => {
    set((state) => {
      const next = new Map(state.byChannelId);
      const prev = next.get(channelId);

      // Cập nhật mốc đọc (luôn, kể cả khi channel chưa có trong byChannelId).
      const nextLastReadMap = new Map(state.lastReadMap);
      if (messageId) {
        const currentRead = nextLastReadMap.get(channelId);
        // Không đi lùi mốc đọc.
        if (!currentRead || !isMessageIdLE(messageId, currentRead)) {
          nextLastReadMap.set(channelId, messageId);
        }
      }

      if (!prev) {
        // Channel chưa có badge → không có gì để xoá, chỉ cần lưu mốc đọc.
        return { ...state, lastReadMap: nextLastReadMap };
      }

      next.set(channelId, {
        ...prev,
        count: 0,
        unread: false,
      });

      return {
        byChannelId: next,
        countUnreadChannelDM: getCountUnreadChannelDM(next),
        countUnreadWorkspace: getCountUnreadWorkspace(next),
        lastReadMap: nextLastReadMap,
      };
    });
  },
}));
