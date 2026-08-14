import { create } from "zustand";
import { getIsDarkModeFromLS, setIsDarkModeToLS } from "../utils/auth";
import { Socket } from "socket.io-client";

type AppStoreType = {
  isDarkMode: boolean;
  setIsDarkMode: (isDarkMode: boolean) => void;

  socket: Socket | null;
  setSocket: (socket: Socket | null) => void;

  isSocketConnected: boolean;
  setIsSocketConnected: (value: boolean) => void;

  reset: () => void;
};

const initialDarkMode = getIsDarkModeFromLS();

if (initialDarkMode) {
  document.documentElement.classList.add("dark");
}

export const useBaseStore = create<AppStoreType>((set) => ({
  isDarkMode: initialDarkMode,
  setIsDarkMode: (isDarkMode: boolean) => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    set({ isDarkMode });
    setIsDarkModeToLS(isDarkMode);
  },

  isSocketConnected: false,
  setIsSocketConnected: (value: boolean) => set({ isSocketConnected: value }),

  socket: null,
  setSocket: (socket: Socket | null) => set({ socket }),

  reset: () => {
    set({
      socket: null,
      isSocketConnected: false,
    });
  },
}));
