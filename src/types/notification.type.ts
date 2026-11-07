export enum NotificationType {
  CHANNEL_INVITED = "CHANNEL_INVITED",
  CHANNEL_INVITE_REVOKED = "CHANNEL_INVITE_REVOKED",
  CHANNEL_REQUEST_APPROVED = "CHANNEL_REQUEST_APPROVED",
  CHANNEL_REQUEST_REJECTED = "CHANNEL_REQUEST_REJECTED",
  FRIEND_REQUEST = "FRIEND_REQUEST",
  FRIEND_REQUEST_ACCEPTED = "FRIEND_REQUEST_ACCEPTED",
  MENTION = "MENTION",
  SYSTEM = "SYSTEM",
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  actorId: string;
  actorName: string;
  actorAvatar: string;
  channelId: string;
  channelName: string;
  workspaceId: string;
  metadata: Record<string, unknown>;
  isRead: boolean;
  readAt: string;
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
