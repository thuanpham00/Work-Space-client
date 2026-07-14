import { create } from "zustand";
import { getAccessTokenFromLS, getIsDarkModeFromLS, getUserFromLS } from "../utils/auth";
import type { UserType } from "../types/user.type";

type AppStoreType = {
  user: UserType;
  setUser: (user: UserType) => void;
  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDarkMode: boolean) => void;

  reset: () => void;
};

const initialDarkMode = getIsDarkModeFromLS();

if (initialDarkMode) {
  document.documentElement.classList.add("dark");
}

export const useAppStore = create<AppStoreType>((set) => ({
  user: getUserFromLS(),
  setUser: (user: UserType) => set({ user }),

  accessToken: getAccessTokenFromLS(),
  setAccessToken: (accessToken: string | null) => set({ accessToken }),

  isDarkMode: initialDarkMode,
  setIsDarkMode: (isDarkMode: boolean) => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    set({ isDarkMode });
  },

  reset: () =>
    set({
      user: null,
      accessToken: null,
    }),
}));
