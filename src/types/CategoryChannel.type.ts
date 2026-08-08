export interface CategoryChannel {
  id: string;
  workspaceId: string;
  name: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export type CategoryChannelBody = {
  workspaceId: string;
  name: string;
};
