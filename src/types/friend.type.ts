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

export interface FriendDMChannelResponse {
  id: string;
  channelId: string;
  name: string | null;
  description: string | null;
  type: string | null;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  friend: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    status: string;
    fullName: string;
    createdAt: string;
  };
  lastMessage: {
    id: string;
    channelId: string;
    senderId: string;
    content: string;
    messageType: string;
    replyToId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    sender: {
      id: string;
      username: string;
      displayName: string;
      avatar: string;
      status: string;
      fullName: string;
    };
  };
}
