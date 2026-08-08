import type { Channel } from "./channel.type";

export type WorkspaceType = {
  id: string;
  name: string;
  description: string;
  avatar: null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  categories: CategoryWorkspace[];
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
