import React, { useCallback, useImperativeHandle, useMemo, useState } from "react";
import { Modal, Button, Spin, App } from "antd";
import { X, Calendar, User, Users, UserPlus } from "lucide-react";
import AvatarFallback from "../../../../components/AvatarFallback/AvatarFallback";
import { formatDateString } from "../../../../utils/utils";
import styles from "./ChannelProfileModal.module.scss";
import { useMutation, useQuery } from "react-query";
import { workspaceAPI } from "../../../../apis/workspace.api";
import { WorkspaceMemberStatus } from "../../../../types/workspace.type";
import { channelApi } from "../../../../apis/channel.api";
import type { ChannelProfile } from "../../../../types/channel.type";

export interface ChannelProfileModalRef {
  openModal: (idChannelId: string) => void;
  closeModal: () => void;
}

interface ChannelProfileModalProps {
  backgroundUrlDM?: string;
  accentDM?: string;
  onChannelChange?: () => void;
}

const PLACEHOLDER = "—";

export const ChannelProfileModal = React.forwardRef<ChannelProfileModalRef, ChannelProfileModalProps>(
  ({ backgroundUrlDM, accentDM, onChannelChange }, ref) => {
    const { message } = App.useApp();

    const [visible, setVisible] = useState(false);
    const [channelId, setChannelId] = useState<string>("");

    const { data, isLoading, refetch } = useQuery({
      queryKey: ["infoChannel", channelId],
      queryFn: () => channelApi.infoChannelStatus(channelId),
      staleTime: 1000 * 60 * 5,
      enabled: !!channelId && visible,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channelData = (data as any)?.data?.data?.channel as ChannelProfile;

    useImperativeHandle(ref, () => ({
      openModal: (idChannelId: string) => {
        setVisible(true);
        setChannelId(idChannelId);
      },
      closeModal: () => {
        setVisible(false);
      },
    }));

    const handleClose = useCallback(() => {
      setVisible(false);
      setChannelId("");
      onChannelChange?.();
    }, [onChannelChange]);

    const bannerStyle = useMemo(() => {
      if (backgroundUrlDM) {
        return { backgroundImage: `url(${backgroundUrlDM})` };
      }
      if (accentDM) {
        return { backgroundColor: accentDM };
      }
      return undefined;
    }, [backgroundUrlDM, accentDM]);

    const status = (channelData?.channelStatus as WorkspaceMemberStatus) ?? undefined;

    const requestWorkspaceMutation = useMutation({
      mutationFn: (id: string) => workspaceAPI.requestInvite(id),
    });

    const handleRequestInvite = useCallback(async () => {
      if (!channelId) return;
      try {
        await requestWorkspaceMutation.mutateAsync(channelId);
        message.success("Yêu cầu tham gia workspace đã được gửi");
        refetch();
      } catch (error) {
        console.error(error);
      }
    }, [channelId, message, requestWorkspaceMutation, refetch]);

    const cancelRequestMutation = useMutation({
      mutationFn: (id: string) => workspaceAPI.requestCancel(id),
    });

    const handleCancelRequest = useCallback(async () => {
      if (!channelId) return;
      try {
        await cancelRequestMutation.mutateAsync(channelId);
        message.success("Đã hủy yêu cầu tham gia workspace");
        refetch();
      } catch (error) {
        console.error(error);
      }
    }, [channelId, message, cancelRequestMutation, refetch]);

    const infoItems = useMemo(() => {
      if (!channelData) return [];

      const items: {
        key: string;
        icon: React.ElementType;
        label: string;
        value: React.ReactNode;
      }[] = [
        {
          key: "owner",
          icon: User,
          label: "Chủ sở hữu",
          value: channelData.workspaceOwner?.fullName || channelData.workspaceOwner?.username || PLACEHOLDER,
        },
        {
          key: "joined",
          icon: Calendar,
          label: "Ngày tạo",
          value: formatDateString(channelData.createdAt),
        },
        {
          key: "members",
          icon: Users,
          label: "Thành viên",
          value: `0 thành viên`,
        },
      ];

      return items;
    }, [channelData]);

    return (
      <Modal
        open={visible}
        onCancel={handleClose}
        footer={null}
        width={480}
        centered
        className={styles.workspaceProfileModal}
        closeIcon={<X size={18} className={styles.closeIcon} />}
        destroyOnClose
      >
        {isLoading || !channelData ? (
          <div className={styles.loadingWrapper}>
            <Spin size="medium" tip="Loading..." />
          </div>
        ) : (
          <div className={styles.modalBody}>
            <div className={styles.header}>
              <div
                className={`${styles.banner} ${!backgroundUrlDM && !accentDM ? styles.bannerFallback : ""}`}
                style={bannerStyle}
              />
              <div className={styles.avatarWrapper}>
                <AvatarFallback src={null} alt={channelData.name} showStatus={false} size={64} />
              </div>
            </div>

            <div className={styles.content}>
              <div className={styles.meta}>
                <h2 className={styles.workspaceName}>{channelData.name}</h2>
                {channelData.description && <p className={styles.description}>{channelData.description}</p>}
              </div>

              <div className={styles.actions}>
                {(!status || status === WorkspaceMemberStatus.BANNED) && (
                  <Button
                    type="primary"
                    icon={<UserPlus size={16} />}
                    className={`${styles.friendRequestBtn} ${styles.messageBtn}`}
                    onClick={handleRequestInvite}
                  >
                    Tham gia
                  </Button>
                )}

                {status === WorkspaceMemberStatus.PENDING_REQUEST && (
                  <Button
                    danger
                    icon={<X size={16} />}
                    className={`${styles.friendRequestBtn} ${styles.messageBtn}`}
                    onClick={handleCancelRequest}
                  >
                    Hủy yêu cầu
                  </Button>
                )}
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
                        <span className={styles.infoValue}>{item.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>
    );
  },
);

ChannelProfileModal.displayName = "ChannelProfileModal";
