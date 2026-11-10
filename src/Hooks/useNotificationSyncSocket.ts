import { useSocketEvent } from "./useSocketEvent";
import { SOCKET_LISTEN_EVENT } from "./events";
import type { NotificationReadPayload } from "./events";

interface NotificationSyncHandlers {
  enabled: boolean;
  onRead: (payload: NotificationReadPayload) => void;
  onReadAll: () => void;
}

/**
 * Nhóm đồng bộ notification giữa các tab — state `notifications` vẫn nằm
 * local trong `NotificationBell.tsx`, hook này chỉ gom phần đăng ký.
 * `NotificationBell` dùng hook này thay cho `socket.on` trực tiếp.
 */
export function useNotificationSyncSocket({ enabled, onRead, onReadAll }: NotificationSyncHandlers) {
  useSocketEvent(SOCKET_LISTEN_EVENT.NOTIFICATION_READ, onRead, enabled);
  useSocketEvent(SOCKET_LISTEN_EVENT.NOTIFICATION_READ_ALL, onReadAll, enabled);
}
