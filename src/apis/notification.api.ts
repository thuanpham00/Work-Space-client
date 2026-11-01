import type { NotificationListResponse, NotificationItem } from "../types/notification.type";
import type { QueryBase } from "../types/query.type";
import type { SuccessResponse } from "../types/utils.type";
import Http from "../utils/http";

export const notificationApi = {
  getList: (params: QueryBase) => {
    return Http.get<SuccessResponse<NotificationListResponse>>("/notifications", { params });
  },

  markAsRead: (id: string) => {
    return Http.patch<SuccessResponse<{ notification: NotificationItem; unreadCount: number }>>(
      `/notifications/${id}/read`,
    );
  },

  markAllAsRead: () => {
    return Http.patch<SuccessResponse<{ updatedCount: number; unreadCount: number }>>(
      "/notifications/read-all",
    );
  },
};
