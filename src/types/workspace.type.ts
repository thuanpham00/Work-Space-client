import type { Channel } from "./channel.type";
import type { UserType } from "./user.type";

export type WorkspaceType = {
  id: string;
  name: string;
  description: string;
  avatar: null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  categories: CategoryWorkspace[];
  countUnread?: number;
  owner: UserType;
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
