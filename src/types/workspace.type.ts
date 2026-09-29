import type { Channel } from "./channel.type";
import type { StatusRequest, UserType, WorkspaceInvitePolicy } from "./user.type";

export type WorkspaceType = {
  id: string;
  name: string;
  description: string;
  avatar: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  categories: CategoryWorkspace[];
  countUnread?: number;
  owner: UserType;
  role?: WorkspaceMemberRole;
  workspaceStatus?: WorkspaceMemberStatus;
};

export type CategoryWorkspace = {
  id: string;
  workspaceId: string;
  name: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  channels: Channel[];
};

export enum WorkspaceMemberStatus {
  ACTIVE = "ACTIVE",
  LEFT = "LEFT",
  BANNED = "BANNED",
  MUTED = "MUTED",
  PENDING_INVITE = "PENDING_INVITE",
  PENDING_REQUEST = "PENDING_REQUEST",
}

export enum WorkspaceMemberRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  OWNER = "OWNER",
}

export interface WorkspaceRequestItem {
  userId: string;
  username: string;
  avatar: string | null;
  fullName: string | null;
  status: string;
  role: WorkspaceMemberRole;
  type: "invite" | "join";
  invitedById: string | null;
  invitedByName: string | null;
  requestedById: string | null;
  invitedAt: string | null;
  joinedAt: string | null;
}

export interface WorkspaceRequestsResponse {
  requests: WorkspaceRequestItem[];
  inviteCount: number;
  joinCount: number;
}

export enum InviteDenialReason {
  OK = "OK",
  ALREADY_MEMBER = "ALREADY_MEMBER",
  ALREADY_PENDING_INVITE = "ALREADY_PENDING_INVITE",
  ALREADY_PENDING_REQUEST = "ALREADY_PENDING_REQUEST",
  FRIENDS_ONLY_POLICY = "FRIENDS_ONLY_POLICY",
  NO_FRIEND_REQUEST = "NO_FRIEND_REQUEST",
  SELF_INVITE = "SELF_INVITE",
}

export interface InviteSearchItem {
  id: string;
  username: string;
  displayName: string;
  fullName: string | null;
  avatar: string | null;
  friendStatus: StatusRequest | null;
  workspaceInvitePolicy: WorkspaceInvitePolicy | null;
  existingWorkspaceStatus: WorkspaceMemberStatus | null;
  canInvite: boolean;
  reason: InviteDenialReason;
}

export interface InviteSearchResponse {
  items: InviteSearchItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  workspaceId: string;
}

export interface InviteSearchParams {
  search?: string;
  page?: number;
  limit?: number;
}
