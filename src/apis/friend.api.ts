import type { FriendResponse, FriendStatusRequestType } from "../types/friend.type";
import type { SuccessResponse } from "../types/utils.type";
import Http from "../utils/http";

export const friendApi = {
  getFriends: (params: FriendStatusRequestType) => {
    return Http.get<SuccessResponse<{ friends: FriendResponse[]; total: number }>>("/users/friends", {
      params,
    });
  },
};
