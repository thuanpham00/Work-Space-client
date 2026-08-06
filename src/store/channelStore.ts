import { create } from "zustand";
import {
  getChannelIdFromLS,
  getFriendIdFromLS,
  getModeListFriendFromLS,
  getWorkspaceIdFromLS,
  setChannelIdToLS,
  setFriendIdToLS,
  setModeListFriendToLS,
  setWorkspaceIdToLS,
} from "../utils/auth";

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
};

export const useChannelStore = create<AppStoreType>((set) => ({
  friendId: getFriendIdFromLS(),

  channelId: getChannelIdFromLS(),
  setChannelId: (channelId: string) => {
    set({ channelId });
    setChannelIdToLS(channelId);
  },

  workspaceId: getWorkspaceIdFromLS(),
  setWorkspaceId: (workspaceId: string) => {
    set({ workspaceId });
    setWorkspaceIdToLS(workspaceId);
  },

  modeListFriend: getModeListFriendFromLS() as ModeListFriend,

  chooseChannelFriend: (friendId: string, modeListFriend: ModeListFriend) => {
    set({ friendId, modeListFriend });
    setFriendIdToLS(friendId);
    setModeListFriendToLS(modeListFriend);
    if (modeListFriend === "list") {
      setChannelIdToLS("");
    }
  },

  reset: () => {
    set({
      friendId: "",
      channelId: "",
      workspaceId: "",
      modeListFriend: getModeListFriendFromLS() as ModeListFriend,
    });
  },
}));
