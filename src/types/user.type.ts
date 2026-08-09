import type { Dayjs } from "dayjs";

export enum GenderType {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
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
  status: string;
  bio: string;
  phone: string;
  dateOfBirth: string | Dayjs;
  createdAt: string;
  updatedAt: string;
  gender: GenderType;
  receivedFriendRequests?: { status: string }[];
  privacySettings?: {
    showEmail: boolean;
    showPhone: boolean;
    showBirthday: boolean;
    showGender: boolean;
  };
};

export type ListUserParamsType = {
  page: number;
  limit: number;
  search: string;
};
