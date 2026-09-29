import type { ChannelSearchType } from "./channel.type";
import type { UserType } from "./user.type";

export type SearchItemType = "user" | "workspace";

export type SearchQuery = "all" | "users" | "channels";

export type SearchItem = UserType | ChannelSearchType;

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
