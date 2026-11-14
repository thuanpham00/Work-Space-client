/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ChannelInviteResolvedPayload,
  ChannelInviteRevokedPayload,
  ChannelInviteWithdrawnPayload,
  ChannelInvitedPayload,
  ChannelReadPayload,
  ChannelRequestCancelledPayload,
  ChannelRequestResolvedPayload,
  ChannelRequestSentPayload,
  ChannelRequestWithdrawnPayload,
  ChannelUnreadPayload,
} from "../types/channel.type";
import type { Message } from "../types/message.type";

/** Server cấp token mới sau khi refresh thành công. */
export interface TokenRefreshPayload {
  accessToken: string;
  refreshToken: string;
}

/** Server báo lỗi auth (ví dụ RT hết hạn). */
export interface AuthErrorPayload {
  message: string;
  code?: number;
  type?: string;
  refreshToken?: string;
}

/** Đồng bộ trạng thái đã đọc 1 notification giữa các tab/thiết bị. */
export interface NotificationReadPayload {
  notificationId: string;
  unreadCount: number;
  readAt: string;
}

export type ChannelSettingsUpdatedPayload = unknown;
export type ChannelNicknamesUpdatedPayload = unknown;
export type ChannelUpdatedPayload = unknown;
export type ReceiveAttachmentsPayload = unknown;

export interface ServerToClientEvents {
  // -- auth / vòng đời (đang xử lý ở App.tsx) --
  token_refresh: TokenRefreshPayload;
  auth_error: AuthErrorPayload;

  // -- phòng chat (đang xử lý ở useChannelSocket) --
  receive_message: Message;
  receive_message_global: Message;
  receive_attachments: ReceiveAttachmentsPayload;
  channel_settings_updated: ChannelSettingsUpdatedPayload;
  channel_nicknames_updated: ChannelNicknamesUpdatedPayload;
  channel_updated: ChannelUpdatedPayload;

  // -- membership (đang xử lý ở useChannelMembershipSocket) --
  channel_invited: ChannelInvitedPayload;
  channel_invite_revoked: ChannelInviteRevokedPayload;
  channel_request_sent: ChannelRequestSentPayload;
  channel_request_cancelled: ChannelRequestCancelledPayload;
  channel_invite_resolved: ChannelInviteResolvedPayload;
  channel_invite_withdrawn: ChannelInviteWithdrawnPayload;
  channel_request_resolved: ChannelRequestResolvedPayload;
  channel_request_withdrawn: ChannelRequestWithdrawnPayload;

  // -- badge unread sidebar (đang xử lý ở ListMenu.tsx) --
  channel_unread: ChannelUnreadPayload;
  channel_read: ChannelReadPayload;

  // -- đồng bộ notification (đang xử lý ở NotificationBell.tsx) --
  notification_read: NotificationReadPayload;
  notification_read_all: void;
}

// ============================================================================
// Client → Server (client dùng `socket.emit`)
// ============================================================================

export interface SendMessageEmitPayload {
  channel_id: string;
  content: string;
  message_type: string;
  files?: any[];
}

export interface SendGifEmitPayload {
  channel_id: string;
  file_name: string;
  file_url: string;
  mime_type: string;
  file_size: any;
}

export interface MarkReadEmitPayload {
  channel_id: string;
  message_id: string;
}

export interface ClientToServerEvents {
  heartbeat: void;
  join_channel: string;
  leave_channel: string;
  mark_read: MarkReadEmitPayload;
  send_message: SendMessageEmitPayload;
  send_gif: SendGifEmitPayload;
}

/** Tên event server → client, dùng thay cho string literal rải rác. */
export const SOCKET_LISTEN_EVENT = {
  TOKEN_REFRESH: "token_refresh",
  AUTH_ERROR: "auth_error",
  RECEIVE_MESSAGE: "receive_message",
  RECEIVE_MESSAGE_GLOBAL: "receive_message_global",
  RECEIVE_ATTACHMENTS: "receive_attachments",
  CHANNEL_SETTINGS_UPDATED: "channel_settings_updated",
  CHANNEL_NICKNAMES_UPDATED: "channel_nicknames_updated",
  CHANNEL_UPDATED: "channel_updated",
  CHANNEL_INVITED: "channel_invited",
  CHANNEL_INVITE_REVOKED: "channel_invite_revoked",
  CHANNEL_REQUEST_SENT: "channel_request_sent",
  CHANNEL_REQUEST_CANCELLED: "channel_request_cancelled",
  CHANNEL_INVITE_RESOLVED: "channel_invite_resolved",
  CHANNEL_INVITE_WITHDRAWN: "channel_invite_withdrawn",
  CHANNEL_REQUEST_RESOLVED: "channel_request_resolved",
  CHANNEL_REQUEST_WITHDRAWN: "channel_request_withdrawn",
  CHANNEL_UNREAD: "channel_unread",
  CHANNEL_READ: "channel_read",
  NOTIFICATION_READ: "notification_read",
  NOTIFICATION_READ_ALL: "notification_read_all",
} as const satisfies Record<string, keyof ServerToClientEvents>;

/** Tên event client → server, dùng thay cho string literal rải rác. */
export const SOCKET_EMIT_EVENT = {
  HEARTBEAT: "heartbeat",
  JOIN_CHANNEL: "join_channel",
  LEAVE_CHANNEL: "leave_channel",
  MARK_READ: "mark_read",
  SEND_MESSAGE: "send_message",
  SEND_GIF: "send_gif",
} as const satisfies Record<string, keyof ClientToServerEvents>;

export type SocketListenEventName = keyof ServerToClientEvents;
export type SocketEmitEventName = keyof ClientToServerEvents;
