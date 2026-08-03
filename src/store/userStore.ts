import { create } from "zustand";
import { getAccessTokenFromLS, getUserFromLS, setAccessTokenToLS, setUserToLS } from "../utils/auth";
import type { UserType } from "../types/user.type";
type AppStoreType = {
  user: UserType;
  setUser: (user: UserType | null) => void;
  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;

  reset: () => void;
};

export const useUserStore = create<AppStoreType>((set) => ({
  user: getUserFromLS(),
  setUser: (user: UserType) => {
    set({ user });
    setUserToLS(user);
  },

  accessToken: getAccessTokenFromLS(),
  setAccessToken: (accessToken: string | null) => {
    set({ accessToken });
    setAccessTokenToLS(accessToken);
  },

  reset: () => {
    set({
      user: null,
      accessToken: null,
    });
  },
}));
