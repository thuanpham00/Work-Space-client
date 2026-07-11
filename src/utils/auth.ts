import type { UserType } from "../types/user.type";

export const setAccessTokenToLS = (accessToken: string) => {
  return localStorage.setItem("access_token", accessToken);
};

export const getAccessTokenFromLS = () => {
  return localStorage.getItem("access_token") || "";
};

export const setUserToLS = (user: UserType) => {
  return localStorage.setItem("user", JSON.stringify(user));
};

export const getUserFromLS = () => {
  const result = localStorage.getItem("user");
  return result ? JSON.parse(result) : null;
};

export const setIsDarkModeToLS = (isDarkMode: boolean) => {
  return localStorage.setItem("is_dark_mode", isDarkMode ? "true" : "false");
};

export const getIsDarkModeFromLS = () => {
  const result = localStorage.getItem("is_dark_mode");
  return result ? result === "true" : true;
};

export const LocalStorageEventTarget = new EventTarget(); // tạo ra 1 event target để lắng nghe sự kiện thay đổi LocalStorage

export const clearLS = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  const ClearLSEvent = new Event("ClearLS");
  LocalStorageEventTarget.dispatchEvent(ClearLSEvent); // phát sự kiện
};
