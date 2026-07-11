import type { UserType } from "./user.type";

export type SuccessResponse<Data> = {
  message: string;
  data: Data;
};

export type ErrorResponse<Data> = {
  message: string;
  errors?: Data;
};

export type MessageResponse = {
  message: string;
};

export type AuthResponse = SuccessResponse<{
  access_token: string;
  user: UserType;
}>;
