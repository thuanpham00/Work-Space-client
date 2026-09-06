import React, { useImperativeHandle, useMemo, useState } from "react";
import { Modal, Tabs, Button, Tooltip } from "antd";
import type { Channel, MemberChannel } from "../../../../types/channel.type";
import {
  MessageSquare,
  UserPlus,
  MoreHorizontal,
  X,
  Calendar,
  Mail,
  Phone,
  User,
  Cake,
  Lock,
  Users,
  Server,
} from "lucide-react";
import AvatarFallback from "../../../../components/AvatarFallback/AvatarFallback";
import { formatDateString } from "../../../../utils/utils";
import styles from "./FullProfileModal.module.scss";
import { StatusUser } from "../../../../types/friend.type";
import { useUserStore } from "../../../../store/userStore";

export interface FullProfileModalRef {
  openModal: () => void;
  closeModal: () => void;
}

interface FullProfileModalProps {
  channelDMDetail: Channel;
  backgroundUrlDM?: string;
  accentDM?: string;
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
  ({ channelDMDetail, backgroundUrlDM, accentDM }, ref) => {
    const [visible, setVisible] = useState(false);
    const userId = useUserStore((app) => app.user?.id);
    const infoReceiver = channelDMDetail?.members?.find((member) => member.userId !== userId);

    useImperativeHandle(ref, () => ({
      openModal: () => setVisible(true),
      closeModal: () => setVisible(false),
    }));

    const friend = infoReceiver as MemberChannel | undefined;

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
      if (!friend) return [];

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
          value: formatDateString(friend.createdAt),
        },
      ];

      if (friend.email) {
        items.push({
          key: "email",
          icon: Mail,
          label: "Email",
          value: friend.privacySettings?.showEmail ? friend.email : MASKED_VALUE,
          isPrivate: !friend.privacySettings?.showEmail,
        });
      }

      if (friend.phone) {
        items.push({
          key: "phone",
          icon: Phone,
          label: "Số điện thoại",
          value: friend.privacySettings?.showPhone ? friend.phone : MASKED_VALUE,
          isPrivate: !friend.privacySettings?.showPhone,
        });
      }

      if (friend.gender) {
        items.push({
          key: "gender",
          icon: User,
          label: "Giới tính",
          value: friend.privacySettings?.showGender ? getGenderLabel(friend.gender) : MASKED_VALUE,
          isPrivate: !friend.privacySettings?.showGender,
        });
      }

      if (friend.dateOfBirth) {
        items.push({
          key: "birthday",
          icon: Cake,
          label: "Ngày sinh",
          value: friend.privacySettings?.showBirthday
            ? formatDateString(friend.dateOfBirth)
            : MASKED_VALUE,
          isPrivate: !friend.privacySettings?.showBirthday,
        });
      }

      return items;
    }, [friend]);

    if (!friend) return null;

    const status = friend.status as StatusUser;
    const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG[StatusUser.OFFLINE];

    const tabItems = [
      {
        key: "mutual-friends",
        label: "Bạn chung",
        children: (
          <EmptyState
            icon={Users}
            title="Chưa có bạn chung"
            subtitle="Bạn bè chung sẽ hiển thị ở đây"
          />
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

    return (
      <Modal
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={480}
        centered
        className={styles.fullProfileModal}
        closeIcon={<X size={18} className={styles.closeIcon} />}
      >
        <div className={styles.modalBody}>
          <div className={styles.header}>
            <div
              className={`${styles.banner} ${!backgroundUrlDM && !accentDM ? styles.bannerFallback : ""}`}
              style={bannerStyle}
            />
            <div className={styles.avatarWrapper}>
              <AvatarFallback
                className={styles.avatarOverride}
                src={friend.avatar}
                alt={friend.username}
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
              <h2 className={styles.fullName}>{friend.fullName}</h2>
              <p className={styles.username}>@{friend.username}</p>
              <span className={`${styles.statusPill} ${statusConfig.className}`}>
                <span className={styles.statusDot} />
                {statusConfig.label}
              </span>
            </div>

            <div className={styles.actions}>
              <Button type="primary" className={styles.messageBtn} icon={<MessageSquare size={16} />}>
                Tin nhắn
              </Button>
              <Tooltip title="Thêm bạn">
                <Button className={styles.iconBtn} icon={<UserPlus size={16} />} />
              </Tooltip>
              <Tooltip title="Tuỳ chọn">
                <Button className={styles.iconBtn} icon={<MoreHorizontal size={16} />} />
              </Tooltip>
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
      </Modal>
    );
  },
);
