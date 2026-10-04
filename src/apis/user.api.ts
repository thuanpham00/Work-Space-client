import type {
  ChangePasswordBodyType,
  LoginBodyType,
  RegisterBodyType,
  UpdateUserBodyType,
} from "../types/auth.type";
import type { Media } from "../types/media.type";
import type { Setting, UpdateSettingsBodyType, UserType } from "../types/user.type";
import type { AuthResponse, SuccessResponse } from "../types/utils.type";
import Http from "../utils/http";

export const userAPI = {
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

  getSettings: () => {
    return Http.get<SuccessResponse<{ settings: Setting }>>("/users/settings");
  },

  updateSettings: (data: UpdateSettingsBodyType) => {
    return Http.patch<SuccessResponse<{ settings: Setting }>>("/users/settings", data);
  },

  refreshToken: () => {
    return Http.post<AuthResponse>("/users/refresh-token");
  },

  update: (data: UpdateUserBodyType) => {
    return Http.patch<SuccessResponse<{ user: UserType }>>("/users/me", data);
  },

  uploadAvatar: (file: FormData) => {
    return Http.post<SuccessResponse<Media>>("/users/upload", file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  changePassword: (data: ChangePasswordBodyType) => {
    return Http.post<SuccessResponse<{ message: string }>>("/users/change-password", data);
  },

  infoUserStatus: (userId: string) => {
    return Http.get<SuccessResponse<{ user: UserType; channel: { id: string; name: string } }>>(
      `/users/${userId}/status`,
    );
  },
};
