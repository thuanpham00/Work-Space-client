import type { UserType } from "./user.type";

export type Message = {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  messageType: string;
  replyToId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: UserType;
  sender: UserType;
};

export const messageType = {
  TEXT: "TEXT",
  FILE: "FILE",
  IMAGE: "IMAGE",
  EMOJI: "EMOJI",
};

export type MessageType = (typeof messageType)[keyof typeof messageType];
