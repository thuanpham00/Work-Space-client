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
import type { ModeListFriend } from "../pages/Friend/FriendPage";

type AppStoreType = {
  friendId: string | null;
  setFriendId: (friendId: string | null) => void;
  channelId: string | null;
  setChannelId: (channelId: string | null) => void;
  serverId: string | null;
  setServerId: (serverId: string | null) => void;

  modeListFriend: ModeListFriend;
  setModeListFriend: (mode: ModeListFriend) => void;

  reset: () => void;
};

export const useChannelStore = create<AppStoreType>((set) => ({
  friendId: getFriendIdFromLS(),
  setFriendId: (friendId: string | null) => {
    set({ friendId });
    setFriendIdToLS(friendId);
  },

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
  setModeListFriend: (modeListFriend: ModeListFriend) => {
    set({ modeListFriend });
    setModeListFriendToLS(modeListFriend);
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
