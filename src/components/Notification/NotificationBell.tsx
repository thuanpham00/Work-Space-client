/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Badge, Popover } from "antd";
import { BellOutlined, CheckOutlined, LoadingOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import styles from "./NotificationBell.module.scss";
import AvatarFallback from "../AvatarFallback/AvatarFallback";
import { NotificationType, type NotificationItem } from "../../types/notification.type";
import { notificationApi } from "../../apis/notification.api";
import { useUserStore } from "../../store/userStore";
import { LIMIT, PAGE } from "../../constants/config";
import { useBaseStore } from "../../store/baseStore";
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export default function NotificationBell() {
  const token = useUserStore((state) => state.accessToken);
  const socket = useBaseStore((state) => state.socket);
  const navigate = useNavigate();

  const [query, setQuery] = useState<{ limit: number; page: number }>({
    limit: LIMIT,
    page: PAGE,
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCountBadge, setUnreadCountBadge] = useState(0);

  const { data, isFetching } = useQuery({
    queryKey: ["notificationList", token, query],
    queryFn: () => notificationApi.getList(query),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });

  const listData = data?.data?.data;
  const incoming = listData?.notifications;
  const unreadCount = listData?.unreadCount ?? 0;
  const totalPages = listData?.totalPages ?? 1;
  const hasMore = query.page < totalPages;

  useEffect(() => {
    if (!incoming) return;

    setNotifications((prev) => (query.page === PAGE ? incoming : [...prev, ...incoming]));
    setUnreadCountBadge(unreadCount);
  }, [incoming, unreadCount, query.page]);

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
  });

  const handleLoadMore = () => {
    if (!hasMore || isFetching) return;
    setQuery((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  const handleMarkAsRead = (item: NotificationItem) => {
    if (!item.isRead) {
      markAsReadMutation.mutate(item.id);
    }

    if (
      item.type === NotificationType.CHANNEL_INVITED ||
      item.type === NotificationType.CHANNEL_INVITE_ACCEPTED ||
      item.type === NotificationType.CHANNEL_REQUEST_SENT ||
      item.type === NotificationType.CHANNEL_REQUEST_APPROVED ||
      item.type === NotificationType.CHANNEL_REQUEST_REJECTED
    ) {
      const inviteToken = item.metadata?.inviteToken as string | undefined;
      if (inviteToken) {
        navigate(`/invite/${inviteToken}`);
      }
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadCountBadge === 0) return;
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
          disabled={unreadCountBadge === 0 || markAllAsReadMutation.isLoading}
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
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true, readAt: readAt } : n)),
      );
      setUnreadCountBadge(unreadCount);
    };

    const handleReadAll = () => {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: n.readAt ?? new Date().toISOString() })),
      );
      setUnreadCountBadge(0);
    };

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
      <Badge
        className={styles.trigger}
        count={unreadCountBadge}
        overflowCount={99}
        size="small"
        offset={[2, 10]}
      >
        <button type="button" className={styles.triggerButton} aria-label="Thông báo">
          <BellOutlined />
        </button>
      </Badge>
    </Popover>
  );
}
