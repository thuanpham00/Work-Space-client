import type { Channel } from "./channel.type";
import type { UserType } from "./user.type";

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
  PENDING_INVITE = "PENDING_INVITE",
  PENDING_REQUEST = "PENDING_REQUEST",
  REJECTED = "REJECTED",
  LEFT = "LEFT",
  CANCELLED = "CANCELLED",
}

export enum WorkspaceMemberRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  OWNER = "OWNER",
}

export interface WorkspaceMember {
  workspaceId: string;
  userId: string;
  role: string;
  status: WorkspaceMemberStatus;
  joinedAt: string | null;
  invitedAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  invitedById: string | null;
  requestedById: string;
  approvedById: string | null;
  approvedByType: string | null;
}

export interface WorkspaceMemberItem {
  id: string;
  username: string;
  avatar: string | null;
  fullName: string | null;
  status: string;
  role: WorkspaceMemberRole;
  joinedAt: string | null;
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
