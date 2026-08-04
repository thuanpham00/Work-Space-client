import { create } from "zustand";
import {
  getChannelIdFromLS,
  getFriendIdFromLS,
  getModeListFriendFromLS,
  getServerIdFromLS,
  setChannelIdToLS,
  setFriendIdToLS,
  setModeListFriendToLS,
} from "../utils/auth";

export const modeListFriend = {
  list: "list",
  chat: "chat",
} as const;

export type ModeListFriend = (typeof modeListFriend)[keyof typeof modeListFriend];

type AppStoreType = {
  friendId: string | null;
  channelId: string | null;
  serverId: string | null;
  modeListFriend: ModeListFriend;

  setChannelId: (channelId: string | null) => void;
  setServerId: (serverId: string | null) => void;
  reset: () => void;
  chooseChannelFriend: (friendId: string, mode: ModeListFriend, channelId?: string | null) => void;
};

export const useChannelStore = create<AppStoreType>((set) => ({
  friendId: getFriendIdFromLS(),

  channelId: getChannelIdFromLS(),
  setChannelId: (channelId: string | null) => {
    set({ channelId });
    setChannelIdToLS(channelId);
  },

  serverId: getServerIdFromLS(),
  setServerId: (serverId: string | null) => {
    set({ serverId });
    setChannelIdToLS(serverId);
  },

  modeListFriend: getModeListFriendFromLS() as ModeListFriend,

  chooseChannelFriend: (friendId: string, modeListFriend: ModeListFriend, channelId?: string | null) => {
    set({ friendId, modeListFriend });
    setFriendIdToLS(friendId);
    setModeListFriendToLS(modeListFriend);
    setChannelIdToLS(channelId);
  },

  reset: () => {
    set({
      friendId: null,
      channelId: null,
      serverId: null,
      modeListFriend: getModeListFriendFromLS() as ModeListFriend,
    });
  },
}));
