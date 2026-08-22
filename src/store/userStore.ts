import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserType } from "../types/user.type";

type AppStoreType = {
  user: UserType | null;
  setUser: (user: UserType | null) => void;

  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;

  reset: () => void;
};

export const useUserStore = create<AppStoreType>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,

      setUser: (user) => {
        set({ user });
      },

      setAccessToken: (accessToken) => {
        set({ accessToken });
      },

      reset: () => {
        set({
          user: null,
          accessToken: null,
        });
      },
    }),
    {
      name: "user-storage",
    },
  ),
);
