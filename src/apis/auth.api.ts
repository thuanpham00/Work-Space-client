import type { LoginBodyType, RegisterBodyType } from "../types/auth.type";
import type { UserType } from "../types/user.type";
import type { AuthResponse, SuccessResponse } from "../types/utils.type";
import Http from "../utils/http";

export const authAPI = {
  register: (data: RegisterBodyType) => {
    return Http.post<AuthResponse>("/users/register", data);
  },

  login: (data: LoginBodyType) => {
    return Http.post<SuccessResponse<{ access_token: string; user: UserType }>>("/users/login", data);
  },

  logout: () => {
    return Http.post<SuccessResponse<{ message: string }>>("/users/logout");
  },

  getProfile: () => {
    return Http.get<SuccessResponse<{ user: UserType }>>("/users/me");
  },

  refreshToken: () => {
    return Http.post<AuthResponse>("/users/refresh-token");
  },
};
