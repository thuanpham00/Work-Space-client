import { create } from "zustand";
import { persist } from "zustand/middleware";

export const modeListFriend = {
  list: "list",
  chat: "chat",
} as const;

export type ModeListFriend = (typeof modeListFriend)[keyof typeof modeListFriend];

type AppStoreType = {
  friendId: string;
  channelId: string;
  workspaceId: string;
  modeListFriend: ModeListFriend;

  setChannelId: (channelId: string) => void;
  setWorkspaceId: (workspaceId: string) => void;

  reset: () => void;

  chooseChannelFriend: (friendId: string, mode: ModeListFriend) => void;

  chooseChannelWorkspace: (workspaceId: string, channelId: string) => void;
};

export const useChannelStore = create<AppStoreType>()(
  persist(
    (set) => ({
      friendId: "",
      channelId: "",
      workspaceId: "",
      modeListFriend: modeListFriend.list,

      setChannelId: (channelId) => {
        set({ channelId });
      },

      setWorkspaceId: (workspaceId) => {
        set({ workspaceId });
      },

      chooseChannelFriend: (friendId, modeListFriend) => {
        set({
          friendId,
          modeListFriend,
          channelId: "",
          workspaceId: "",
        });
      },

      chooseChannelWorkspace: (workspaceId, channelId) => {
        set({
          channelId,
          workspaceId,
          friendId: "",
          modeListFriend: modeListFriend.list,
        });
      },

      reset: () => {
        set({
          friendId: "",
          channelId: "",
          workspaceId: "",
          modeListFriend: modeListFriend.list,
        });
      },
    }),
    {
      name: "channel-storage",
    },
  ),
);
