import { App, Button, Empty, Input, Modal, Segmented, Spin } from "antd";
import type { ButtonProps } from "antd";
import React, { useImperativeHandle, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Copy, Search, UserPlus, X, UserCheck } from "lucide-react";
import styles from "./InviteMemberWorkspaceModal.module.scss";
import AvatarFallback from "../../../../components/AvatarFallback/AvatarFallback";
import { FriendStatusPill } from "../../../../components/FriendStatusPill/FriendStatusPill";
import { friendApi } from "../../../../apis/friend.api";
import { workspaceAPI } from "../../../../apis/workspace.api";
import { useInviteSearch } from "../../../../Hooks/useInviteSearch";
import { InviteDenialReason, type InviteSearchItem } from "../../../../types/workspace.type";

export interface InviteMemberWorkspaceModalRef {
  openModal: (wsId: string) => void;
}

type InviteAction =
  | { kind: "invite"; item: InviteSearchItem }
  | { kind: "cancel"; item: InviteSearchItem }
  | { kind: "addFriend"; item: InviteSearchItem };

interface UserInviteRowProps {
  item: InviteSearchItem;
  isInviting: boolean;
  isCancelling: boolean;
  isAddingFriend: boolean;
  onAction: (action: InviteAction) => void;
}

const UserInviteRow: React.FC<UserInviteRowProps> = ({
  item,
  isInviting,
  isCancelling,
  isAddingFriend,
  onAction,
}) => {
  const displayName = item.fullName || item.displayName || item.username || "Người dùng";

  return (
    <div className={styles.wmInviteRow}>
      <AvatarFallback src={item.avatar} alt={displayName} size={40} showStatus={false} />
      <div className={styles.wmInviteRowInfo}>
        <div className={styles.wmInviteRowNameRow}>
          <div className={styles.wmInviteRowName}>{displayName}</div>
          <FriendStatusPill friendStatus={item.friendStatus} />
        </div>
        <div className={styles.wmInviteRowUser}>@{item.username}</div>
      </div>
      <div className={styles.wmInviteRowActions}>
        {renderRowAction(item, isInviting, isCancelling, isAddingFriend, onAction)}
      </div>
    </div>
  );
};

function renderRowAction(
  item: InviteSearchItem,
  isInviting: boolean,
  isCancelling: boolean,
  isAddingFriend: boolean,
  onAction: (action: InviteAction) => void,
): React.ReactNode {
  const primaryBtnProps: ButtonProps = { type: "primary", size: "small" };
  const defaultBtnProps: ButtonProps = { size: "small" };

  switch (item.reason) {
    case InviteDenialReason.OK:
      return (
        <Button
          {...primaryBtnProps}
          icon={<UserPlus size={14} />}
          loading={isInviting}
          onClick={() => onAction({ kind: "invite", item })}
        >
          Mời
        </Button>
      );

    case InviteDenialReason.ALREADY_MEMBER:
      return (
        <span className={`${styles.wmInviteBadge} ${styles.wmInviteBadgeMember}`}>Đã là thành viên</span>
      );

    case InviteDenialReason.ALREADY_PENDING_INVITE:
      return (
        <>
          <Button
            {...defaultBtnProps}
            icon={<X size={14} />}
            loading={isCancelling}
            onClick={() => onAction({ kind: "cancel", item })}
          >
            Hủy
          </Button>
        </>
      );

    case InviteDenialReason.ALREADY_PENDING_REQUEST:
      return <span className={`${styles.wmInviteBadge} ${styles.wmInviteBadgeReview}`}>Đang chờ duyệt</span>;

    case InviteDenialReason.FRIENDS_ONLY_POLICY:
    case InviteDenialReason.NO_FRIEND_REQUEST:
      return (
        <Button
          {...primaryBtnProps}
          icon={<UserCheck size={14} />}
          loading={isAddingFriend}
          onClick={() => onAction({ kind: "addFriend", item })}
        >
          Kết bạn
        </Button>
      );

    case InviteDenialReason.SELF_INVITE:
    default:
      return <span className={`${styles.wmInviteBadge} ${styles.wmInviteBadgeDisabled}`}>Không thể mời</span>;
  }
}

function renderExpiresAt(expiresAt: string) {
  if (!expiresAt) return "Link mời không có thời gian hết hạn";
  // expiresAt: ISO string dạng "2026-09-28T04:00:38.215Z"
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return "Link mời không có thời gian hết hạn";

  const pad = (n: number) => String(n).padStart(2, "0");
  const dd = pad(date.getDate());
  const MM = pad(date.getMonth() + 1);
  const yyyy = date.getFullYear();
  const HH = pad(date.getHours());
  const mm = pad(date.getMinutes());

  return `Hết hạn lúc ${dd}/${MM}/${yyyy} ${HH}:${mm}`;
}

export const InviteMemberWorkspaceModal = React.forwardRef<InviteMemberWorkspaceModalRef>((_, ref) => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const [visible, setVisible] = useState(false);
  const [inviteMode, setInviteMode] = useState<string>("link");
  const [wsId, setWsId] = useState("");

  const { items, isLoading, isFetching, hasMore, searchInput, setSearchInput, fetchMore } = useInviteSearch(
    visible ? wsId : null,
  );

  const { data: dataLinkWorkspace } = useQuery({
    queryKey: ["linkWorkspace", wsId],
    queryFn: () => workspaceAPI.getWorkspaceLink(wsId),
    enabled: !!wsId,
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

  const linkWorkspace = dataLinkWorkspace?.data.data.url;
  const expiresAt = dataLinkWorkspace?.data.data.expiresAt;

  const refreshQuery = () => {
    queryClient.invalidateQueries({ queryKey: ["inviteSearch", wsId] });
    queryClient.invalidateQueries({ queryKey: ["memberRequestsWorkspace", wsId] });
    queryClient.invalidateQueries({ queryKey: ["membersWorkspace", wsId] });
  };

  useImperativeHandle(ref, () => ({
    openModal: (wsId: string) => {
      setVisible(true);
      setWsId(wsId);
    },
  }));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(linkWorkspace || "");
    message.success("Đã sao chép link mời!");
  };

  const inviteMutation = useMutation({
    mutationFn: (userId: string) => workspaceAPI.inviteUser(wsId, userId),
    onSuccess: () => {
      message.success("Đã gửi lời mời");
      refreshQuery();
    },
  });

  const cancelInviteMutation = useMutation({
    mutationFn: (userId: string) => workspaceAPI.cancelInvite(wsId, userId),
    onSuccess: () => {
      message.success("Đã hủy lời mời");
      refreshQuery();
    },
  });

  const addFriendMutation = useMutation({
    mutationFn: (friendId: string) => friendApi.addFriend(friendId),
    onSuccess: () => {
      message.success("Đã gửi lời mời kết bạn");
      refreshQuery();
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["countStatusFriends"] });
    },
  });

  const handleAction = (action: InviteAction) => {
    switch (action.kind) {
      case "invite":
        inviteMutation.mutate(action.item.id);
        break;
      case "cancel":
        cancelInviteMutation.mutate(action.item.id);
        break;
      case "addFriend":
        addFriendMutation.mutate(action.item.id);
        break;
    }
  };

  const trimmedSearch = searchInput.trim();
  const showInitialHint = trimmedSearch.length === 0;
  const showLoadingState = isLoading || (isFetching && items.length === 0);
  const showEmptyResults = !showLoadingState && !showInitialHint && items.length === 0;

  // Map loading state cho từng row theo mutation
  const rowActionState = useMemo(() => {
    const state = new Map<string, { invite: boolean; cancel: boolean; friend: boolean }>();
    for (const item of items) {
      state.set(item.id, {
        invite: inviteMutation.isLoading && inviteMutation.variables === item.id,
        cancel: cancelInviteMutation.isLoading && cancelInviteMutation.variables === item.id,
        friend: addFriendMutation.isLoading && addFriendMutation.variables === item.id,
      });
    }
    return state;
  }, [
    items,
    inviteMutation.isLoading,
    inviteMutation.variables,
    cancelInviteMutation.isLoading,
    cancelInviteMutation.variables,
    addFriendMutation.isLoading,
    addFriendMutation.variables,
  ]);

  const renderSearchBody = () => {
    if (showLoadingState) {
      return (
        <div className={styles.wmInviteLoading}>
          <Spin tip="Đang tìm kiếm..." />
        </div>
      );
    }

    if (showInitialHint) {
      return (
        <Empty
          description="Nhập username hoặc họ tên để tìm người dùng"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ marginTop: 24 }}
        />
      );
    }

    if (showEmptyResults) {
      return (
        <Empty
          description={`Không tìm thấy người dùng phù hợp với "${trimmedSearch}"`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ marginTop: 24 }}
        />
      );
    }

    return (
      <div className={`${styles.wmInviteList} ${isFetching ? styles.wmInviteListRefetching : ""}`}>
        {items.map((item) => {
          const rowState = rowActionState.get(item.id) ?? { invite: false, cancel: false, friend: false };
          return (
            <UserInviteRow
              key={item.id}
              item={item}
              isInviting={rowState.invite}
              isCancelling={rowState.cancel}
              isAddingFriend={rowState.friend}
              onAction={handleAction}
            />
          );
        })}

        {hasMore && (
          <div className={styles.wmInviteFooter}>
            <button
              type="button"
              className={styles.wmInviteLoadMore}
              onClick={fetchMore}
              disabled={isFetching}
            >
              {isFetching ? "Đang tải..." : "Xem thêm"}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      open={visible}
      onCancel={() => setVisible(false)}
      title="Mời thành viên"
      width={620}
      className={styles.wmInviteModal}
      centered
      footer={null}
      mask={{ closable: false }}
    >
      <Segmented
        block
        options={[
          { label: "Link mời", value: "link" },
          { label: "Tìm người dùng", value: "search" },
        ]}
        value={inviteMode}
        onChange={(value) => setInviteMode(value as string)}
        className={styles.wmInviteTab}
      />

      {inviteMode === "link" && (
        <div className={styles.wmInviteLink}>
          <div className={styles.wmInviteLinkLabel}>
            Link mời workspace của bạn ({renderExpiresAt(expiresAt || "")})
          </div>
          <div className={styles.wmInviteLinkBox}>
            <Input value={linkWorkspace} readOnly />
            <Button type="primary" icon={<Copy size={16} />} onClick={handleCopyLink}>
              Sao chép
            </Button>
          </div>
        </div>
      )}

      {inviteMode === "search" && (
        <div>
          <Input
            placeholder="Tìm kiếm theo username hoặc họ tên..."
            prefix={<Search size={16} style={{ color: "var(--color-text-secondary)" }} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={styles.wmInviteSearch}
            allowClear
            autoFocus
          />

          {renderSearchBody()}
        </div>
      )}
    </Modal>
  );
});
