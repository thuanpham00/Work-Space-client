import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WorkspaceMemberRole } from "../types/workspace.type";
import { ChannelMemberRole } from "../types/channel.type";

export const modeListFriend = {
  list: "list",
  chat: "chat",
} as const;

export type ModeListFriend = (typeof modeListFriend)[keyof typeof modeListFriend];

type AppStoreType = {
  modeListFriend: ModeListFriend;
  channelId: string;
  channelName: string;
  workSpaceId: string;
  workSpaceRole: WorkspaceMemberRole | null;
  channelRole: ChannelMemberRole | null;

  chooseChannelFriend: (channelId: string, channelName: string, mode: ModeListFriend) => void;
  chooseChannelWorkspace: (
    workSpaceId: string,
    channelId: string,
    channelName: string,
    workSpaceRole: WorkspaceMemberRole,
    channelRole: ChannelMemberRole,
  ) => void;
  reset: () => void;
};

export const useChannelStore = create<AppStoreType>()(
  persist(
    (set) => ({
      modeListFriend: modeListFriend.list,
      channelId: "",
      channelName: "",
      channelRole: null,
      workSpaceId: "",
      workSpaceRole: null, 

      chooseChannelFriend: (channelId, channelName, modeListFriend) => {
        set({
          modeListFriend,
          channelId,
          channelName,
          channelRole: ChannelMemberRole.MEMBER,
          workSpaceId: "",
          workSpaceRole: null,
        });
      },

      chooseChannelWorkspace: (workSpaceId, channelId, channelName, workSpaceRole, channelRole) => {
        set({
          modeListFriend: modeListFriend.list,
          channelId,
          channelName,
          channelRole,
          workSpaceId,
          workSpaceRole,
        });
      },

      reset: () => {
        set({
          channelId: "",
          channelName: "",
          workSpaceId: "",
          modeListFriend: modeListFriend.list,
          workSpaceRole: null,
          channelRole: null,
        });
      },
    }),
    {
      name: "channel-storage",
    },
  ),
);
