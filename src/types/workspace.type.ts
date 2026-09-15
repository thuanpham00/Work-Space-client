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

