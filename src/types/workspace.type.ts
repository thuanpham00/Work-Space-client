import type { Channel } from "./channel.type";

export type WorkspaceType = {
  id: string;
  name: string;
  description: string;
  avatar: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  channels?: Channel[];
};
