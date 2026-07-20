export type FriendStatusRequestType = {
  status: string;
  search: string;
};

export interface FriendResponse {
  id: string;
  username: string;
  displayName: string;
  avatar: null;
  status: string;
  fullName: string;
  createdAt: string;
}

export const statusUser = {
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
  AWAY: "AWAY",
  BUSY: "BUSY",
} as const;

export type StatusUser = (typeof statusUser)[keyof typeof statusUser];
