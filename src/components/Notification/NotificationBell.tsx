/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Badge, Popover } from "antd";
import { BellOutlined, CheckOutlined, LoadingOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import styles from "./NotificationBell.module.scss";
import AvatarFallback from "../AvatarFallback/AvatarFallback";
import type { NotificationItem } from "../../types/notification.type";
import { notificationApi } from "../../apis/notification.api";
import { useUserStore } from "../../store/userStore";
import { LIMIT, PAGE } from "../../constants/config";
import { useBaseStore } from "../../store/baseStore";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export default function NotificationBell() {
  const token = useUserStore((state) => state.accessToken);
  const socket = useBaseStore((state) => state.socket);
  const queryClient = useQueryClient();

  const [query, setQuery] = useState<{ limit: number; page: number }>({
    limit: 1,
    page: PAGE,
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const { data, isFetching } = useQuery({
    queryKey: ["notificationList", token, query],
    queryFn: () => notificationApi.getList(query),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });

  const listData = data?.data?.data;
  const totalPages = listData?.totalPages ?? 1;
  const unreadCount = listData?.unreadCount ?? 0;
  const hasMore = query.page < totalPages;

  useEffect(() => {
    const incoming = listData?.notifications;
    if (!incoming) return;

    setNotifications((prev) => (query.page === PAGE ? incoming : [...prev, ...incoming]));
  }, [listData, query.page]);

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: (res) => {
      const { notification, unreadCount } = res.data.data;
      queryClient.setQueryData(["notificationList", token, query], (old: any) => {
        if (!old?.data?.data) return old;
        const list = old.data.data;
        return {
          ...old,
          data: {
            ...old.data,
            data: {
              ...list,
              notifications: list.notifications.map((n: NotificationItem) =>
                n.id === notification.id ? { ...n, isRead: true, readAt: notification.readAt } : n,
              ),
              unreadCount,
            },
          },
        };
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: (res) => {
      console.log("res", res);
      queryClient.invalidateQueries({ queryKey: ["notificationList", token] });
    },
  });

  const handleLoadMore = () => {
    if (!hasMore || isFetching) return;
    setQuery((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  const handleMarkAsRead = (item: NotificationItem) => {
    if (item.isRead) return;
    markAsReadMutation.mutate(item.id);
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;
    markAllAsReadMutation.mutate();
  };

  const panelContent = (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Thông báo</span>
        <button
          type="button"
          className={styles.markAllButton}
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0 || markAllAsReadMutation.isLoading}
        >
          <CheckOutlined /> Đánh dấu đã đọc tất cả
        </button>
      </div>

      {notifications.length === 0 && !isFetching ? (
        <div className={styles.emptyState}>Bạn không có thông báo nào</div>
      ) : (
        <div className={styles.list}>
          {notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.item} ${item.isRead ? "" : styles.itemUnread}`}
              onClick={() => handleMarkAsRead(item)}
            >
              <AvatarFallback
                src={item.actorAvatar}
                alt={item.actorName ?? item.title}
                size={40}
                showStatus={false}
              />

              <span className={styles.itemBody}>
                <span className={`${styles.itemTitle} ${item.isRead ? "" : styles.itemTitleUnread}`}>
                  {item.title}
                </span>
                {item.body && <span className={styles.itemDescription}>{item.body}</span>}
                <span className={styles.itemMeta}>
                  <span className={styles.itemTime}>{dayjs(item.createdAt).fromNow()}</span>
                  {!item.isRead && <span className={styles.unreadDot} />}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <div className={styles.panelFooter}>
          {hasMore ? (
            <button
              type="button"
              className={styles.footerButton}
              onClick={handleLoadMore}
              disabled={isFetching}
            >
              {isFetching ? <LoadingOutlined spin /> : null} Xem thêm
            </button>
          ) : (
            <span className={styles.footerHint}>Đã hiển thị tất cả thông báo</span>
          )}
        </div>
      )}
    </div>
  );

  useEffect(() => {
    if (!socket || !token) return;

    const handleRead = ({
      notificationId,
      unreadCount,
      readAt,
    }: {
      notificationId: string;
      unreadCount: number;
      readAt: string;
    }) => {
      queryClient.setQueriesData(["notificationList", token, query], (old: any) => {
        if (!old?.data?.data) return old;
        const list = old.data.data;
        return {
          ...old,
          data: {
            ...old.data,
            data: {
              ...list,
              notifications: list.notifications.map((n: NotificationItem) =>
                n.id === notificationId ? { ...n, isRead: true, readAt: readAt } : n,
              ),
              unreadCount,
            },
          },
        };
      });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: n.readAt ?? new Date().toISOString() })),
      );
    };

    const handleReadAll = () => {};

    // đồng bộ noti giữa nhiều socket (cùng user)
    socket.on("notification_read", handleRead);
    socket.on("notification_read_all", handleReadAll);

    return () => {
      socket.off("notification_read", handleRead);
      socket.off("notification_read_all", handleReadAll);
    };
  }, [socket, token]);

  return (
    <Popover
      content={panelContent}
      trigger="click"
      placement="bottomRight"
      arrow={false}
      styles={{
        container: { padding: 0, background: "transparent", boxShadow: "none" },
        content: { padding: 0 },
      }}
    >
      <Badge className={styles.trigger} count={unreadCount} overflowCount={99} size="small" offset={[2, 10]}>
        <button type="button" className={styles.triggerButton} aria-label="Thông báo">
          <BellOutlined />
        </button>
      </Badge>
    </Popover>
  );
}
