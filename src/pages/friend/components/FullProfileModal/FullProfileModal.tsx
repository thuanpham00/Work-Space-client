import React, { useCallback, useImperativeHandle, useMemo, useState } from "react";
import { Modal, Tabs, Button, Tooltip, Spin, App } from "antd";
import {
  MessageSquare,
  UserPlus,
  MoreHorizontal,
  X,
  UserCheck,
  Calendar,
  Mail,
  Phone,
  User,
  Cake,
  Lock,
  Users,
  Server,
  Check,
} from "lucide-react";
import AvatarFallback from "../../../../components/AvatarFallback/AvatarFallback";
import { formatDateString } from "../../../../utils/utils";
import styles from "./FullProfileModal.module.scss";
import { StatusUser } from "../../../../types/friend.type";
import { useMutation, useQuery } from "react-query";
import { userAPI } from "../../../../apis/user.api";
import type { UserType } from "../../../../types/user.type";
import { StatusRequest } from "../../../../types/user.type";
import { friendApi } from "../../../../apis/friend.api";
import { queryClient } from "../../../../main";
import { modeListFriend, useChannelStore } from "../../../../store/channelStore";
import { useUserStore } from "../../../../store/userStore";
import type { FriendDMChannelResponse } from "../../../../types/friend.type";

export interface FullProfileModalRef {
  openModal: () => void;
  closeModal: () => void;
}

interface FullProfileModalProps {
  userId: string;
  backgroundUrlDM?: string;
  accentDM?: string;
  enableFriendRequest?: boolean;
  onFriendRequestChange?: () => void;
  onMessageClick?: () => void;
}

const STATUS_CONFIG: Record<StatusUser, { label: string; className: string }> = {
  [StatusUser.ONLINE]: { label: "Đang hoạt động", className: styles.statusOnline },
  [StatusUser.BUSY]: { label: "Bận", className: styles.statusBusy },
  [StatusUser.OFFLINE]: { label: "Offline", className: styles.statusOffline },
};

const MASKED_VALUE = "••••••••";

function getGenderLabel(gender: string) {
  if (gender === "MALE") return "Nam";
  if (gender === "FEMALE") return "Nữ";
  return "Khác";
}

function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon}>
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <p className={styles.emptyStateTitle}>{title}</p>
      <p className={styles.emptyStateSubtitle}>{subtitle}</p>
    </div>
  );
}

export const FullProfileModal = React.forwardRef<FullProfileModalRef, FullProfileModalProps>(
  (
    { userId, backgroundUrlDM, accentDM, enableFriendRequest = false, onFriendRequestChange, onMessageClick },
    ref,
  ) => {
    const [visible, setVisible] = useState(false);
    const [sending, setSending] = useState(false);
    const [openingChat, setOpeningChat] = useState(false);

    const { message } = App.useApp();
    const chooseChannelFriend = useChannelStore((app) => app.chooseChannelFriend);
    const accessToken = useUserStore((app) => app.accessToken);

    const {
      data: dataUser,
      isLoading,
      refetch,
    } = useQuery({
      queryKey: ["infoUser", userId],
      queryFn: () => userAPI.infoUserStatus(userId as string),
      staleTime: 1000 * 60 * 5,
      enabled: !!userId && visible,
    });

    const userData = dataUser?.data.data.user as UserType | undefined;

    const addFriendMutation = useMutation({
      mutationFn: (friendId: string) => friendApi.addFriend(friendId),
    });

    const acceptFriendMutation = useMutation({
      mutationFn: (friendId: string) => friendApi.acceptFriend(friendId),
    });

    const rejectFriendMutation = useMutation({
      mutationFn: (friendId: string) => friendApi.rejectedFriend(friendId),
    });

    useImperativeHandle(ref, () => ({
      openModal: () => setVisible(true),
      closeModal: () => setVisible(false),
    }));

    const handleClose = useCallback(() => {
      setVisible(false);
      setSending(false);
      setOpeningChat(false);
    }, []);

    const refreshFriendQueries = useCallback(() => {
      refetch();
      onFriendRequestChange?.();
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friendsChannels"] });
      queryClient.invalidateQueries({ queryKey: ["listUser"] });
    }, [refetch, onFriendRequestChange]);

    const handleAddRequest = useCallback(async () => {
      if (!userId || !userData) return;

      setSending(true);
      try {
        await addFriendMutation.mutateAsync(userId);
        message.success(`Đã gửi lời mời kết bạn tới ${userData.fullName}`);
        refreshFriendQueries();
      } catch (error) {
        console.log(error);
        message.error("Có lỗi xảy ra khi gửi lời mời kết bạn");
      } finally {
        setSending(false);
      }
    }, [userId, userData, addFriendMutation, message, refreshFriendQueries]);

    const handleCancelRequest = useCallback(async () => {
      if (!userId || !userData) return;

      setSending(true);
      try {
        await addFriendMutation.mutateAsync(userId);
        message.success(`Đã hủy lời mời tới ${userData.fullName}`);
        refreshFriendQueries();
      } catch (error) {
        console.log(error);
        message.error("Có lỗi xảy ra khi hủy lời mời");
      } finally {
        setSending(false);
      }
    }, [userId, userData, addFriendMutation, message, refreshFriendQueries]);

    const handleAcceptRequest = useCallback(async () => {
      if (!userId || !userData) return;

      setSending(true);
      try {
        await acceptFriendMutation.mutateAsync(userId);
        message.success(`Đã đồng ý kết bạn với ${userData.fullName}`);
        refreshFriendQueries();
      } catch (error) {
        console.log(error);
        message.error("Có lỗi xảy ra khi đồng ý kết bạn");
      } finally {
        setSending(false);
      }
    }, [userId, userData, acceptFriendMutation, message, refreshFriendQueries]);

    const handleRejectRequest = useCallback(async () => {
      if (!userId || !userData) return;

      setSending(true);
      try {
        await rejectFriendMutation.mutateAsync(userId);
        message.success(`Đã từ chối kết bạn với ${userData.fullName}`);
        refreshFriendQueries();
      } catch (error) {
        console.log(error);
        message.error("Có lỗi xảy ra khi từ chối kết bạn");
      } finally {
        setSending(false);
      }
    }, [userId, userData, rejectFriendMutation, message, refreshFriendQueries]);

    const findFriendChannelId = useCallback(async () => {
      const cached = queryClient.getQueryData<{
        data: { data: { channels: FriendDMChannelResponse[] } };
      }>(["friendsChannels", StatusRequest.ACCEPTED, accessToken, ""]);

      const cachedChannelId = cached?.data?.data?.channels?.find(
        (channel) => channel.friend.id === userId,
      )?.channelId;

      if (cachedChannelId) return cachedChannelId;

      const response = await friendApi.getChannelsFriends({ search: "" });
      return response.data.data.channels.find((channel) => channel.friend.id === userId)?.channelId;
    }, [accessToken, userId]);

    const handleOpenMessage = useCallback(async () => {
      if (!userId) return;

      setOpeningChat(true);
      try {
        const channelId = await findFriendChannelId();

        if (!channelId) {
          message.error("Không tìm thấy cuộc trò chuyện");
          return;
        }

        chooseChannelFriend(channelId, modeListFriend.chat);
        handleClose();
        onMessageClick?.();
      } catch (error) {
        console.log(error);
        message.error("Không thể mở cuộc trò chuyện");
      } finally {
        setOpeningChat(false);
      }
    }, [userId, findFriendChannelId, chooseChannelFriend, handleClose, onMessageClick, message]);

    const bannerStyle = useMemo(() => {
      if (backgroundUrlDM) {
        return { backgroundImage: `url(${backgroundUrlDM})` };
      }
      if (accentDM) {
        return { backgroundColor: accentDM };
      }
      return undefined;
    }, [backgroundUrlDM, accentDM]);

    const infoItems = useMemo(() => {
      if (!userData) return [];

      const items: {
        key: string;
        icon: React.ElementType;
        label: string;
        value: React.ReactNode;
        isPrivate?: boolean;
      }[] = [
        {
          key: "joined",
          icon: Calendar,
          label: "Gia nhập",
          value: formatDateString(userData.createdAt),
        },
      ];

      if (userData.email) {
        items.push({
          key: "email",
          icon: Mail,
          label: "Email",
          value: userData.privacySettings?.showEmail ? userData.email : MASKED_VALUE,
          isPrivate: !userData.privacySettings?.showEmail,
        });
      }

      if (userData.phone) {
        items.push({
          key: "phone",
          icon: Phone,
          label: "Số điện thoại",
          value: userData.privacySettings?.showPhone ? userData.phone : MASKED_VALUE,
          isPrivate: !userData.privacySettings?.showPhone,
        });
      }

      if (userData.gender) {
        items.push({
          key: "gender",
          icon: User,
          label: "Giới tính",
          value: userData.privacySettings?.showGender ? getGenderLabel(userData.gender) : MASKED_VALUE,
          isPrivate: !userData.privacySettings?.showGender,
        });
      }

      if (userData.dateOfBirth) {
        items.push({
          key: "birthday",
          icon: Cake,
          label: "Ngày sinh",
          value: userData.privacySettings?.showBirthday
            ? formatDateString(userData.dateOfBirth as string)
            : MASKED_VALUE,
          isPrivate: !userData.privacySettings?.showBirthday,
        });
      }

      return items;
    }, [userData]);

    const friendStatus = userData?.friendStatus;

    const status = (userData?.status as StatusUser) ?? StatusUser.OFFLINE;
    const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG[StatusUser.OFFLINE];

    const tabItems = [
      {
        key: "mutual-friends",
        label: "Bạn chung",
        children: (
          <EmptyState icon={Users} title="Chưa có bạn chung" subtitle="Bạn bè chung sẽ hiển thị ở đây" />
        ),
      },
      {
        key: "mutual-servers",
        label: "Máy chủ chung",
        children: (
          <EmptyState
            icon={Server}
            title="Chưa có máy chủ chung"
            subtitle="Các workspace chung sẽ hiển thị ở đây"
          />
        ),
      },
    ];

    const renderActions = () => {
      if (enableFriendRequest) {
        switch (friendStatus) {
          case StatusRequest.ACCEPTED:
            return (
              <div className={styles.friendActionsRow}>
                <Button
                  disabled
                  icon={<UserCheck size={16} />}
                  className={`${styles.friendRequestBtn} ${styles.friendRequestAccepted}`}
                >
                  Bạn bè
                </Button>
                <Button
                  type="primary"
                  loading={openingChat}
                  icon={<MessageSquare size={16} />}
                  className={`${styles.friendRequestBtn} ${styles.messageBtn}`}
                  onClick={handleOpenMessage}
                >
                  Nhắn tin
                </Button>
              </div>
            );

          case StatusRequest.REQUESTED:
            return (
              <Button
                block
                type="primary"
                loading={sending}
                icon={<X size={16} />}
                className={styles.friendRequestBtn}
                onClick={handleCancelRequest}
              >
                Hủy lời mời
              </Button>
            );

          case StatusRequest.RECEIVED:
            return (
              <div className={styles.friendActionsRow}>
                <Button
                  type="primary"
                  loading={sending}
                  icon={<Check size={16} />}
                  className={`${styles.friendRequestBtn} ${styles.messageBtn}`}
                  onClick={handleAcceptRequest}
                >
                  Chấp nhận
                </Button>
                <Button
                  loading={sending}
                  icon={<X size={16} />}
                  className={styles.friendRequestBtn}
                  onClick={handleRejectRequest}
                >
                  Từ chối
                </Button>
              </div>
            );

          default:
            return (
              <Button
                block
                type="primary"
                loading={sending}
                icon={<UserPlus size={16} />}
                className={styles.friendRequestBtn}
                onClick={handleAddRequest}
              >
                Kết bạn
              </Button>
            );
        }
      }

      return (
        <>
          <Button type="primary" className={styles.messageBtn} icon={<MessageSquare size={16} />}>
            Tin nhắn
          </Button>
          <Tooltip title="Thêm bạn">
            <Button className={styles.iconBtn} icon={<UserPlus size={16} />} />
          </Tooltip>
          <Tooltip title="Tuỳ chọn">
            <Button className={styles.iconBtn} icon={<MoreHorizontal size={16} />} />
          </Tooltip>
        </>
      );
    };

    return (
      <Modal
        open={visible}
        onCancel={handleClose}
        footer={null}
        width={480}
        centered
        className={styles.fullProfileModal}
        closeIcon={<X size={18} className={styles.closeIcon} />}
        destroyOnClose
      >
          {isLoading || !userData ? (
            <div className={styles.loadingWrapper}>
              <Spin size="large" />
            </div>
          ) : (
            <div className={styles.modalBody}>
              <div className={styles.header}>
                <div
                  className={`${styles.banner} ${!backgroundUrlDM && !accentDM ? styles.bannerFallback : ""}`}
                  style={bannerStyle}
                />
                <div className={styles.avatarWrapper}>
                  <AvatarFallback
                    className={styles.avatarOverride}
                    src={userData.avatar}
                    alt={userData.username}
                    size={96}
                    status={status}
                    showStatus={true}
                    statusStyle={{
                      bottom: "6px",
                      right: "6px",
                      width: "18px",
                      height: "18px",
                      border: "4px solid var(--color-bg)",
                    }}
                  />
                </div>
              </div>

              <div className={styles.content}>
                <div className={styles.meta}>
                  <h2 className={styles.fullName}>{userData.fullName}</h2>
                  <p className={styles.username}>@{userData.username}</p>
                  <span className={`${styles.statusPill} ${statusConfig.className}`}>
                    <span className={styles.statusDot} />
                    {statusConfig.label}
                  </span>
                </div>

                <div
                  className={`${styles.actions} ${enableFriendRequest ? styles.actionsFriendRequest : ""}`}
                >
                  {renderActions()}
                </div>

                <div className={styles.infoSection}>
                  {infoItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.key} className={styles.infoRow}>
                        <div className={styles.infoIcon}>
                          <Icon size={16} strokeWidth={1.75} />
                        </div>
                        <div className={styles.infoContent}>
                          <span className={styles.infoLabel}>{item.label}</span>
                          <span className={styles.infoValue}>
                            {item.value}
                            {item.isPrivate && <Lock size={12} className={styles.lockIcon} />}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.tabsSection}>
                  <Tabs defaultActiveKey="mutual-friends" items={tabItems} className={styles.customTabs} />
                </div>
              </div>
            </div>
          )}
      </Modal>
    );
  },
);

FullProfileModal.displayName = "FullProfileModal";
