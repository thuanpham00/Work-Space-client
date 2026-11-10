import { useUnreadStore } from "../store/unreadStore";
import { useUserStore } from "../store/userStore";
import { useSocketEvent } from "./useSocketEvent";
import { SOCKET_LISTEN_EVENT } from "./events";

/**
 * Nhóm badge unread sidebar — logic tách nguyên từ `ListMenu.tsx`.
 * Handler chỉ chạm `unreadStore` (global) nên đưa lên global được,
 * không phụ thuộc state local của component.
 * Được mount qua `useGlobalSocket` ở `MainLayout`.
 */
export function useUnreadSocket() {
  const token = useUserStore((state) => state.accessToken);
  const markUnread = useUnreadStore((state) => state.markUnread);
  const markReadOptimistic = useUnreadStore((state) => state.markReadOptimistic);

  useSocketEvent(
    SOCKET_LISTEN_EVENT.CHANNEL_UNREAD,
    (data) => {
      markUnread(data);
    },
    !!token,
  );

  useSocketEvent(
    SOCKET_LISTEN_EVENT.CHANNEL_READ,
    (data) => {
      markReadOptimistic(data.channelId, data.messageId);
    },
    !!token,
  );
}
