export type FriendStatusRequestType = {
  status: string;
  search: string;
};

export interface FriendResponse {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  status: string;
  fullName: string;
  createdAt: string;
}

export enum StatusUser {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  BUSY = "BUSY",
}

