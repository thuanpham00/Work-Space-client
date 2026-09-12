import type { UserType } from "./user.type";
import type { WorkspaceType } from "./workspace.type";

export type SearchItemType = "user" | "workspace";

export type SearchQuery = "all" | "users" | "workspaces";

export type SearchItem =
  | (UserType & { type: "user"; friendStatus: string })
  | (WorkspaceType & { type: "workspace" });

export type SearchResponse = {
  items: SearchItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalUsers: number;
  totalWorkspaces: number;
  type: string;
};
