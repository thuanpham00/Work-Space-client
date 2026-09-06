import type { FriendDMChannelResponse, FriendResponse, FriendStatusRequestType } from "../types/friend.type";
import type { SuccessResponse } from "../types/utils.type";
import Http from "../utils/http";

export const friendApi = {
  getStatusFriends: (params: FriendStatusRequestType) => {
    return Http.get<SuccessResponse<{ friends: FriendResponse[]; total: number }>>("/friends", {
      params,
    });
  },

  getChannelsFriends: (params: { search: string }) => {
    return Http.get<SuccessResponse<{ channels: FriendDMChannelResponse[]; total: number }>>(
      "/friends/channels",
      {
        params,
      },
    );
  },

  addFriend: (friendId: string) => {
    return Http.post<SuccessResponse<{ message: string }>>(`/friends/add`, { friendId });
  },

  acceptFriend: (friendId: string) => {
    return Http.post<SuccessResponse<{ message: string }>>(`/friends/accept`, { friendId });
  },

  rejectedFriend: (friendId: string) => {
    return Http.post<SuccessResponse<{ message: string }>>(`/friends/reject`, { friendId });
  },
};
