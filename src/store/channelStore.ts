import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WorkspaceMemberRole } from "../types/workspace.type";

export const modeListFriend = {
  list: "list",
  chat: "chat",
} as const;

export type ModeListFriend = (typeof modeListFriend)[keyof typeof modeListFriend];

type AppStoreType = {
  modeListFriend: ModeListFriend;
  channelId: string;
  workspaceId: string;
  workspaceRole: WorkspaceMemberRole;

  setWorkspaceRole: (workspaceRole: WorkspaceMemberRole) => void;
  chooseChannelFriend: (channelId: string, mode: ModeListFriend) => void;
  chooseChannelWorkspace: (workspaceId: string, channelId: string) => void;
  reset: () => void;
};

export const useChannelStore = create<AppStoreType>()(
  persist(
    (set) => ({
      channelId: "",
      workspaceId: "",
      modeListFriend: modeListFriend.list,
      workspaceRole: WorkspaceMemberRole.MEMBER,

      setWorkspaceRole: (workspaceRole) => {
        set({ workspaceRole });
      },

      chooseChannelFriend: (channelId, modeListFriend) => {
        set({
          modeListFriend,
          channelId,
          workspaceId: "",
          workspaceRole: WorkspaceMemberRole.MEMBER,
        });
      },

      chooseChannelWorkspace: (workspaceId, channelId) => {
        set({
          modeListFriend: modeListFriend.list,
          channelId,
          workspaceId,
        });
      },

      reset: () => {
        set({
          modeListFriend: modeListFriend.list,
          channelId: "",
          workspaceId: "",
          workspaceRole: WorkspaceMemberRole.MEMBER,
        });
      },
    }),
    {
      name: "channel-storage",
    },
  ),
);
