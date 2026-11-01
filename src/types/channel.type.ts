import type { UserBasic, UserType } from "./user.type";
import type { CategoryWorkspace, WorkspaceMemberStatus } from "./workspace.type";

export enum ChannelMemberRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export enum ChannelType {
  TEXT = "TEXT",
  VOICE = "VOICE",
  DM = "DM",
}

export interface Channel {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  type: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  members: ChannelMember[];
  config: ChannelConfig;
  isDefault: boolean;
  nicknames: ChannelMemberNickname[];
  category: CategoryWorkspace;
  role: ChannelMemberRole;
}

export interface ChannelBody {
  workspaceId: string;
  name: string;
  type: string;
  categoryId: string;
  description: string;
  isPrivate: boolean;
  isDefault: boolean;
}

export interface ChannelConfig {
  id: string;
  channelId: string;
  backgroundUrl: string;
  backgroundColor: string;
  accent: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelSettingsBody {
  backgroundUrl: string;
  accent: string;
}

export interface ChannelNicknameUpdate {
  userId: string;
  nickname: string;
}

export interface ChannelNicknamesBody {
  nickname: ChannelNicknameUpdate;
}

export interface ChannelMemberNickname {
  id: string;
  channelId: string;
  userId: string;
  user: UserType;
  nickname: string;
  updatedAt: string;
}

export type ChannelUnreadPayload = {
  channelId: string;
  workspaceId: string | null;
  type: ChannelType; // "DM" | "TEXT" | "VOICE"
  count: number; // server tính: total - last_read
  lastMessageId: string;
  senderId: string;
};

export type ChannelReadPayload = {
  channelId: string;
  messageId: string | null;
};

export type ChannelUnread = {
  workspaceId: string | null; // null = channel DM (không thuộc workspace nào)
  channelId: string;
  type: ChannelType;
  lastMessageId: string;
  count: number;
  unread: boolean;
  lastReadMessageId?: string | null;
};

export type ChannelMember = {
  userId: string;
  username: string;
  avatar: string;
  fullName: string;
  role: ChannelMemberRole;
};

export type ChannelSearchType = {
  id: string;
  name: string;
  description: string;
  type: ChannelType;
  workspaceId: string;
  categoryId: string;
  workspaceName: string;
  workspaceOwner: string;
  channelMemberStatus: WorkspaceMemberStatus;
};

export type ChannelProfile = {
  id: string;
  workspaceId: string;
  workspaceName: string;
  categoryId: string;
  name: string;
  description: string;
  type: string;
  isPrivate: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  channelStatus: WorkspaceMemberStatus;
  workspaceOwner: UserBasic;
};

// Request body cho POST /:channelId/invite
export interface InviteUserToChannelBody {
  userId: string;
}

export interface InfoStatusChannelResponse {
  channelId: string;
  userId: string;
  status: string;
}

export interface ChannelRequestItem {
  userId: string;
  username: string;
  avatar: string;
  fullName: string;
  role: ChannelMemberRole;
  type: string;
  invitedById: string;
  invitedByName: string;
  requestedById: string;
  invitedAt: string;
  joinedAt: string;
}

// ============ SOCKET EVENT PAYLOADS (nhóm 1 — người bị tác động) ============

/** Base payload chung cho các event về membership của channel */
export type ChannelEventBase = {
  channelId: string;
  channelName: string | null;
  workspaceId: string | null;
};

/** User được mời vào channel */
export type ChannelInvitedPayload = ChannelEventBase & {
  type: "invite";
  invitedById: string;
  invitedByName: string;
};

/** Lời mời bị admin thu hồi */
export type ChannelInviteRevokedPayload = ChannelEventBase & {
  type: "invite";
  revokedById: string;
  revokedByName: string;
};

/** Yêu cầu tham gia được duyệt / từ chối */
export type ChannelRequestResolvedPayload = ChannelEventBase & {
  type: "join";
  status: "ACTIVE" | "LEFT";
  action: "approved" | "rejected";
  resolvedById: string;
  resolvedByName: string;
};

/** Lời mời được chính user đó accept / reject */
export type ChannelInviteResolvedPayload = ChannelEventBase & {
  type: "invite";
  status: "ACTIVE" | "LEFT";
  action: "accepted" | "rejected";
  /** User thực hiện thao tác — dùng để bỏ qua toast ở tab đã bấm nút */
  actorId: string;
};

/** Membership trong workspace thay đổi → sidebar cần refresh */
export type WorkspaceUpdatedPayload = {
  workspaceId: string;
  channelId: string;
  reason: "joined" | "left";
};
