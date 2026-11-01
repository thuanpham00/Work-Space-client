export type NotificationType =
  | "CHANNEL_INVITED"
  | "CHANNEL_INVITE_REVOKED"
  | "CHANNEL_REQUEST_APPROVED"
  | "CHANNEL_REQUEST_REJECTED"
  | "FRIEND_REQUEST"
  | "FRIEND_REQUEST_ACCEPTED"
  | "MENTION"
  | "SYSTEM";

/** Payload notification từ server — khớp 100% với `NotificationResponse` */
export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  actorId: string | null;
  actorName: string | null;
  actorAvatar: string | null;
  channelId: string | null;
  channelName: string | null;
  workspaceId: string | null;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}
