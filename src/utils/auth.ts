import type { UserType } from "../types/user.type";

export const setAccessTokenToLS = (accessToken: string) => {
  return localStorage.setItem("access_token", accessToken);
};

export const getAccessTokenFromLS = () => {
  return localStorage.getItem("access_token") || "";
};

export const setFriendIdToLS = (friendId: string) => {
  return localStorage.setItem("friend_id", friendId);
};

export const getFriendIdFromLS = () => {
  return localStorage.getItem("friend_id") || "";
};

export const setChannelIdToLS = (channelId: string) => {
  return localStorage.setItem("channel_id", channelId);
};

export const getChannelIdFromLS = () => {
  return localStorage.getItem("channel_id") || "";
};

export const setServerIdToLS = (serverId: string) => {
  return localStorage.setItem("server_id", serverId);
};

export const getServerIdFromLS = () => {
  return localStorage.getItem("server_id") || "";
};

export const setModeListFriendToLS = (mode: string) => {
  return localStorage.setItem("mode_list_friend", mode || "list");
};

export const getModeListFriendFromLS = () => {
  return localStorage.getItem("mode_list_friend") || "list";
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
  localStorage.removeItem("friend_id");
  localStorage.removeItem("channel_id");
  localStorage.removeItem("server_id");
  localStorage.removeItem("mode_list_friend");
  const ClearLSEvent = new Event("ClearLS");
  LocalStorageEventTarget.dispatchEvent(ClearLSEvent); // phát sự kiện
};
