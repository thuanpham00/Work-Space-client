import { useChannelMembershipSocket } from "./useChannelMembershipSocket";
import { useAuthSocket } from "./useAuthSocket";
import { useUnreadSocket } from "./useUnreadSocket";

/**
 * Một đầu mối duy nhất cho mọi socket global (không phụ thuộc channelId).
 * Mount 1 lần ở `MainLayout` — mở file này là thấy app đang nghe gì.
 * - `useAuthSocket`            : heartbeat + token_refresh + auth_error (từ App.tsx)
 * - `useChannelMembershipSocket`: channel_invited / revoked / request_* / resolved (giữ nguyên file Hooks/)
 * - `useUnreadSocket`          : channel_unread + channel_read (từ ListMenu.tsx)
 *
 * Ngoại lệ có lý do, KHÔNG gom vào đây:
 * - `useChannelSocket` (room theo channelId, join/leave + mark_read throttle)
 *   → ở lại `ChannelChat` / `DirectChat`.
 * - `useNotificationSyncSocket` (chạm state local của NotificationBell)
 *   → ở lại `NotificationBell.tsx`, chỉ đổi sang dùng `useSocketEvent`.
 */
export function useGlobalSocket() {
  useAuthSocket();
  useChannelMembershipSocket();
  useUnreadSocket();
}
