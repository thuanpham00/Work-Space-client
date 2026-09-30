import type { Dayjs } from "dayjs";

export enum GenderType {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum WorkMode {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  BUSY = "BUSY",
}

export enum WorkspaceInvitePolicy {
  EVERYONE = "EVERYONE",
  FRIENDS_ONLY = "FRIENDS_ONLY",
}

export const genderTranslate = {
  [GenderType.MALE]: "Nam",
  [GenderType.FEMALE]: "Nữ",
  [GenderType.OTHER]: "Khác",
};

export enum StatusRequest {
  ONLINE = "ONLINE",
  ACCEPTED = "ACCEPTED",
  REQUESTED = "REQUEST_SENT",
  RECEIVED = "REQUEST_RECEIVED",
}

export type UserType = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string;
  fullName: string;
  bio: string;
  phone: string;
  dateOfBirth: string | Dayjs;
  createdAt: string;
  updatedAt: string;
  gender: GenderType;
  type?: string;
  friendStatus?: StatusRequest;
  nickname?: string;
};

export type ListUserParamsType = {
  page: number;
  limit: number;
  search: string;
};

export type PrivacySettings = {
  showEmail: boolean;
  showPhone: boolean;
  showBirthday: boolean;
  showGender: boolean;
};

export type Setting = {
  showEmail: boolean;
  showPhone: boolean;
  showDateOfBirth: boolean;
  showGender: boolean;
  workMode: WorkMode;
  workspaceInvitePolicy: WorkspaceInvitePolicy;
};

export type UpdateSettingsBodyType = {
  showEmail: boolean;
  showPhone: boolean;
  showDateOfBirth: boolean;
  showGender: boolean;
  workMode: WorkMode;
  workspaceInvitePolicy: WorkspaceInvitePolicy;
};

export type UserBasic = {
  id: string;
  username: string;
  avatar: string;
  fullName: string;
};
