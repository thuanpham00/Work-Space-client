import type { Dayjs } from "dayjs";

export type GenderType = "MALE" | "FEMALE" | "OTHER";

export type UserType = {
  id: string;
  email: string;
  password: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  status: string;
  phone: string;
  dateOfBirth: string | Dayjs;
  createdAt: string;
  updatedAt: string;
  gender: GenderType;
  fullName: string;
};
