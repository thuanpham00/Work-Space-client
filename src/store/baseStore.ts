import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Socket } from "socket.io-client";

type AppStoreType = {
  isDarkMode: boolean;
  setIsDarkMode: (isDarkMode: boolean) => void;

  socket: Socket | null;
  setSocket: (socket: Socket | null) => void;

  reset: () => void;
};

export const useBaseStore = create<AppStoreType>()(
  persist(
    (set) => ({
      isDarkMode: false,

      setIsDarkMode: (isDarkMode) => {
        document.documentElement.classList.toggle("dark", isDarkMode);
        set({ isDarkMode });
      },

      socket: null,

      setSocket: (socket) => {
        set({ socket });
      },

      reset: () => {
        set({
          socket: null,
        });
      },
    }),
    {
      name: "base-storage",

      // Chỉ persist isDarkMode
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.isDarkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },
    },
  ),
);
