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

export type ChannelUnread = {
  workspaceId: string;
  channelId: string;
  type: ChannelType;
  lastMessageId: string;
  count: number;
  unread: boolean;
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
