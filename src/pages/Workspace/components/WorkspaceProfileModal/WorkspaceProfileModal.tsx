import React, { useCallback, useImperativeHandle, useMemo, useState } from "react";
import { Modal, Tabs, Button, Spin, App } from "antd";
import { X, Calendar, User, Hash, Users, UserPlus } from "lucide-react";
import AvatarFallback from "../../../../components/AvatarFallback/AvatarFallback";
import { formatDateString } from "../../../../utils/utils";
import styles from "./WorkspaceProfileModal.module.scss";
import { useMutation, useQuery } from "react-query";
import { workspaceAPI } from "../../../../apis/workspace.api";
import { WorkspaceMemberStatus, type WorkspaceType } from "../../../../types/workspace.type";

export interface WorkspaceProfileModalRef {
  openModal: (idWorkspaceId: string) => void;
  closeModal: () => void;
}

interface WorkspaceProfileModalProps {
  backgroundUrlDM?: string;
  accentDM?: string;
  onWorkspaceChange?: () => void;
}

const WORKSPACE_STATUS_CONFIG: Record<WorkspaceMemberStatus, { label: string; className: string }> = {
  [WorkspaceMemberStatus.ACTIVE]: {
    label: "Đang hoạt động",
    className: styles.statusActive,
  },
  [WorkspaceMemberStatus.PENDING_INVITE]: {
    label: "Lời mời đang chờ",
    className: styles.statusPending,
  },
  [WorkspaceMemberStatus.PENDING_REQUEST]: {
    label: "Yêu cầu đang chờ",
    className: styles.statusPending,
  },
  [WorkspaceMemberStatus.REJECTED]: {
    label: "Bị từ chối",
    className: styles.statusRejected,
  },
  [WorkspaceMemberStatus.LEFT]: {
    label: "Đã rời",
    className: styles.statusOffline,
  },
  [WorkspaceMemberStatus.CANCELLED]: {
    label: "Đã hủy",
    className: styles.statusOffline,
  },
};

const PLACEHOLDER = "—";
const MEMBER_COUNT = 0;

export const WorkspaceProfileModal = React.forwardRef<WorkspaceProfileModalRef, WorkspaceProfileModalProps>(
  ({ backgroundUrlDM, accentDM, onWorkspaceChange }, ref) => {
    const { message } = App.useApp();

    const [visible, setVisible] = useState(false);
    const [workspaceId, setWorkspaceId] = useState<string>("");

    const { data, isLoading } = useQuery({
      queryKey: ["infoWorkspace", workspaceId],
      queryFn: () => workspaceAPI.infoWorkspaceStatus(workspaceId),
      staleTime: 1000 * 60 * 5,
      enabled: !!workspaceId && visible,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const workspaceData = (data as any)?.data?.data?.workspace as WorkspaceType | undefined;

    useImperativeHandle(ref, () => ({
      openModal: (idWorkspaceId: string) => {
        setVisible(true);
        setWorkspaceId(idWorkspaceId);
      },
      closeModal: () => {
        setVisible(false);
      },
    }));

    const handleClose = useCallback(() => {
      setVisible(false);
      setWorkspaceId("");
      onWorkspaceChange?.();
    }, [onWorkspaceChange]);

    const bannerStyle = useMemo(() => {
      if (backgroundUrlDM) {
        return { backgroundImage: `url(${backgroundUrlDM})` };
      }
      if (accentDM) {
        return { backgroundColor: accentDM };
      }
      return undefined;
    }, [backgroundUrlDM, accentDM]);

    const status = (workspaceData?.workspaceStatus as WorkspaceMemberStatus) ?? undefined;
    const statusConfig = status ? WORKSPACE_STATUS_CONFIG[status as WorkspaceMemberStatus] : undefined;

    const requestWorkspaceMutation = useMutation({
      mutationFn: (id: string) => workspaceAPI.requestInvite(id),
    });

    const handleRequestInvite = useCallback(async () => {
      if (!workspaceId) return;
      try {
        await requestWorkspaceMutation.mutateAsync(workspaceId);
        message.success("Yêu cầu tham gia workspace đã được gửi");
      } catch (error) {
        console.error(error);
      }
    }, [workspaceId, message, requestWorkspaceMutation]);

    const infoItems = useMemo(() => {
      if (!workspaceData) return [];

      const items: {
        key: string;
        icon: React.ElementType;
        label: string;
        value: React.ReactNode;
      }[] = [
        {
          key: "joined",
          icon: Calendar,
          label: "Ngày tạo",
          value: formatDateString(workspaceData.createdAt),
        },
        {
          key: "description",
          icon: Hash,
          label: "Mô tả",
          value: workspaceData.description || PLACEHOLDER,
        },
        {
          key: "owner",
          icon: User,
          label: "Chủ sở hữu",
          value: workspaceData.owner?.fullName || workspaceData.owner?.username || PLACEHOLDER,
        },
        {
          key: "status",
          icon: Users,
          label: "Trạng thái",
          value: statusConfig ? (
            <span className={`${styles.statusPill} ${statusConfig.className}`} style={{ marginTop: 0 }}>
              <span className={styles.statusDot} />
              {statusConfig.label}
            </span>
          ) : (
            PLACEHOLDER
          ),
        },
      ];

      return items;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workspaceData, status]);

    const tabItems = [
      {
        key: "members",
        label: "Thành viên",
        children: (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <Users size={28} strokeWidth={1.5} />
            </div>
            <p className={styles.emptyStateTitle}>{MEMBER_COUNT} thành viên</p>
            <p className={styles.emptyStateSubtitle}>Danh sách thành viên sẽ hiển thị ở đây</p>
          </div>
        ),
      },
    ];

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
        {isLoading || !workspaceData ? (
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
                  src={workspaceData.avatar}
                  alt={workspaceData.name}
                  size={96}
                  showStatus={false}
                />
              </div>
            </div>

            <div className={styles.content}>
              <div className={styles.meta}>
                <h2 className={styles.workspaceName}>{workspaceData.name}</h2>
                {workspaceData.description && (
                  <p className={styles.description}>{workspaceData.description}</p>
                )}
                {statusConfig && (
                  <span className={`${styles.statusPill} ${statusConfig.className}`}>
                    <span className={styles.statusDot} />
                    {statusConfig.label}
                  </span>
                )}
              </div>

              <div className={styles.actions}>
                <Button
                  type="primary"
                  icon={<UserPlus size={16} />}
                  className={`${styles.friendRequestBtn} ${styles.messageBtn}`}
                  onClick={handleRequestInvite}
                >
                  Tham gia
                </Button>
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

              <div className={styles.tabsSection}>
                <Tabs defaultActiveKey="members" items={tabItems} className={styles.customTabs} />
              </div>
            </div>
          </div>
        )}
      </Modal>
    );
  },
);

WorkspaceProfileModal.displayName = "WorkspaceProfileModal";
