import type { GenderType } from "./user.type";

export type RegisterBodyType = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginBodyType = {
  email: string;
  password: string;
};

export type UpdateUserBodyType = {
  fullName: string;
  phone: string;
  bio: string;
  gender: GenderType;
  dateOfBirth: string;
  avatar?: string;
};

export type ChangePasswordBodyType = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};
