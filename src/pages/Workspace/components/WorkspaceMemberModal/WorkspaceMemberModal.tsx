/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { App, Button, Dropdown, Empty, Input, Modal, Spin, Tabs } from "antd";
import type { DropdownProps } from "antd";
import {
  UserPlus,
  Users,
  Search,
  UserMinus,
  Shield,
  MessageCircle,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import styles from "./WorkspaceMemberModal.module.scss";
import { useQuery } from "react-query";
import { workspaceAPI } from "../../../../apis/workspace.api";
import type { QueryBase } from "../../../../types/query.type";
import {
  WorkspaceMemberRole,
  type WorkspaceMemberItem,
  type WorkspaceRequestItem,
} from "../../../../types/workspace.type";
import AvatarFallback from "../../../../components/AvatarFallback/AvatarFallback";
import { useDebounce } from "../../../../Hooks/useDebounce";
import { ProfileModal, type ProfileModalRef } from "../../../Friend/components/ProfileModal/ProfileModal";
import { useUserStore } from "../../../../store/userStore";

import {
  InviteMemberWorkspaceModal,
  type InviteMemberWorkspaceModalRef,
} from "../InviteMemberWorkspaceModal/InviteMemberWorkspaceModal";
import { useChannelStore } from "../../../../store/channelStore";

export interface WorkspaceMemberModalRef {
  handleOpen: (workspaceId: string, workspaceName: string) => void;
}

interface WorkspaceMemberModalProps {
  workspaceId?: string;
  workspaceName?: string;
  onClose?: () => void;
  onSubmitOk?: () => void;
}

const PAGE_SIZE = 10;

const roleLabels: Record<string, string> = {
  OWNER: "Chủ sở hữu",
  ADMIN: "Quản trị viên",
  MEMBER: "Thành viên",
};

const roleClasses: Record<string, string> = {
  OWNER: styles.wmRoleOwner,
  ADMIN: styles.wmRoleAdmin,
  MEMBER: styles.wmRoleMember,
};

const MemberItem = ({
  member,
  userId,
  buildMemberMenuItems,
}: {
  member: WorkspaceMemberItem;
  userId: string;
  buildMemberMenuItems: (member: WorkspaceMemberItem) => DropdownProps["menu"];
}) => {
  const displayName = member.fullName || member.username || "Người dùng";
  return (
    <div className={styles.wmMemberItem}>
      <AvatarFallback src={member.avatar} alt={displayName} size={40} showStatus={false} />
      <div className={styles.wmMemberInfo}>
        <div className={styles.wmMemberName}>{displayName}</div>
        <div className={styles.wmMemberEmail}>@{member.username}</div>
      </div>
      <div className={styles.wmMemberMeta}>
        <span className={`${styles.wmMemberRole} ${roleClasses[member.role] || ""}`}>
          {roleLabels[member.role] || member.role}
        </span>
        {userId === member.id && <span className={styles.wmMemberYouBadge}>Bạn</span>}
      </div>
      {userId !== member.id && (
        <Dropdown
          menu={buildMemberMenuItems(member)}
          trigger={["click"]}
          placement="bottomRight"
          overlayClassName={styles.wmDropdownOverlay}
        >
          <button
            type="button"
            className={styles.wmMemberMoreBtn}
            aria-label="Tùy chọn thành viên"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={18} />
          </button>
        </Dropdown>
      )}
    </div>
  );
};

const WorkspaceMemberModal = forwardRef<WorkspaceMemberModalRef, WorkspaceMemberModalProps>(
  ({ onClose }, ref) => {
    const { message } = App.useApp();
    const userId = useUserStore((app) => app.user?.id);
    const workspaceRole = useChannelStore((app) => app.workspaceRole);
    const isOwner = workspaceRole === WorkspaceMemberRole.OWNER;
    const isAdmin = workspaceRole === WorkspaceMemberRole.ADMIN;

    const [open, setOpen] = useState(false);
    const [wsId, setWsId] = useState("");
    const [wsName, setWsName] = useState("");
    const [activeTab, setActiveTab] = useState<"pending" | "members">("members");
    const [searchKeyword, setSearchKeyword] = useState("");

    const profileModalRef = useRef<ProfileModalRef>(null);
    const inviteMemberWorkspaceModal = useRef<InviteMemberWorkspaceModalRef>(null);

    const [page, setPage] = useState(1);
    const [query, setQuery] = useState<QueryBase>({ page: 1, limit: PAGE_SIZE, search: "" });

    const debouncedSearchKeyword = useDebounce(searchKeyword, 500);

    useEffect(() => {
      setQuery((prev) => ({ ...prev, search: debouncedSearchKeyword }));
    }, [debouncedSearchKeyword]);

    useImperativeHandle(ref, () => ({
      handleOpen: (workspaceId: string, workspaceName: string) => {
        setWsId(workspaceId);
        setWsName(workspaceName);
        setOpen(true);
        setActiveTab("members");
        setSearchKeyword("");
        setPage(1);
        setQuery({ page: 1, limit: PAGE_SIZE, search: "" });
      },
    }));

    const { data: dataMemberRequestsWorkspace, isLoading: isLoadingMemberRequestsWorkspace } = useQuery({
      queryKey: ["memberRequestsWorkspace", wsId],
      queryFn: () => workspaceAPI.getMemberWorkspaceRequests(wsId),
      enabled: Boolean(wsId) && open && (isOwner || isAdmin), // chỉ owner/admin mới xem được yêu cầu
      keepPreviousData: true,
    });

    const requestsResponse = dataMemberRequestsWorkspace?.data.data;
    const requestsWorkspace = useMemo<WorkspaceRequestItem[]>(
      () => requestsResponse?.requests ?? [],
      [requestsResponse?.requests],
    );
    const inviteCount = requestsResponse?.inviteCount ?? 0;
    const joinCount = requestsResponse?.joinCount ?? 0;

    const { data: dataMembersWorkspace, isLoading: isLoadingMembersWorkspace } = useQuery({
      queryKey: ["membersWorkspace", wsId, query],
      queryFn: () => workspaceAPI.getMembersWorkspace(wsId, query),
      enabled: Boolean(wsId) && open,
      keepPreviousData: true,
    });

    const membersResponse = dataMembersWorkspace?.data.data;
    const membersWorkspace = useMemo<WorkspaceMemberItem[]>(
      () => membersResponse?.members ?? [],
      [membersResponse?.members],
    );
    const totalMembers = membersResponse?.total ?? 0;
    const totalPages = membersResponse?.totalPages ?? 1;
    const hasMore = page < totalPages;

    const handleLoadMore = () => {
      const nextPage = page + 1;
      setPage(nextPage);
      setQuery((prev) => ({ ...prev, page: nextPage }));
    };

    const handleApproveRequest = (userId: string) => {
      message.success("Đã duyệt yêu cầu!");
    };

    const handleRejectRequest = (userId: string) => {
      message.success("Đã từ chối yêu cầu!");
    };

    const handleCancelInvite = (userId: string) => {
      message.success("Đã hủy lời mời!");
    };

    const handleInviteUser = (userId: string) => {
      message.success("Đã gửi lời mời!");
    };

    const handleRemoveMember = (userId: string) => {
      Modal.confirm({
        title: "Xác nhận xóa thành viên",
        content: "Bạn có chắc chắn muốn xóa thành viên này khỏi workspace?",
        okText: "Xóa",
        cancelText: "Hủy",
        okButtonProps: { danger: true },
        onOk: () => {
          message.success("Đã xóa thành viên!");
        },
      });
    };

    const handleChangeRole = (userId: string, newRole: string) => {
      message.success(`Đã thay đổi vai trò thành ${roleLabels[newRole] || newRole}!`);
    };

    const handleViewProfile = (userId: string) => {
      profileModalRef.current?.openModal(userId);
    };

    const handleSendMessage = (userId: string) => {
      message.info(`Mở cuộc trò chuyện với ${userId}`);
    };

    const buildMemberMenuItems = (member: WorkspaceMemberItem): DropdownProps["menu"] => {
      const items: NonNullable<DropdownProps["menu"]>["items"] = [
        {
          key: "view-profile",
          label: "Xem hồ sơ",
          icon: <Users size={14} />,
          onClick: () => handleViewProfile(member.id),
        },
        {
          key: "send-message",
          label: "Nhắn tin",
          icon: <MessageCircle size={14} />,
          onClick: () => handleSendMessage(member.id),
        },
      ];

      if (member.role !== WorkspaceMemberRole.OWNER) {
        items.push(
          {
            key: "change-role",
            label: "Đổi vai trò",
            icon: <Shield size={14} />,
            children: [
              {
                key: "role-admin",
                label: "Quản trị viên",
                disabled: member.role === WorkspaceMemberRole.ADMIN,
                onClick: () => handleChangeRole(member.id, WorkspaceMemberRole.ADMIN),
              },
              {
                key: "role-member",
                label: "Thành viên",
                disabled: member.role === WorkspaceMemberRole.MEMBER,
                onClick: () => handleChangeRole(member.id, WorkspaceMemberRole.MEMBER),
              },
            ],
          },
          {
            key: "remove",
            label: "Xóa khỏi workspace",
            icon: <UserMinus size={14} />,
            danger: true,
            onClick: () => handleRemoveMember(member.id),
          },
        );
      }

      return { items };
    };

    const tabsItems = [
      {
        key: "members",
        label: `Thành viên (${totalMembers})`,
      },
      ...(isOwner || isAdmin
        ? [
            {
              key: "pending",
              label: `Lượt duyệt (${inviteCount + joinCount})`,
            },
          ]
        : []),
    ];

    return (
      <>
        <Modal
          open={open}
          onCancel={() => {
            setOpen(false);
            onClose?.();
          }}
          width={760}
          className={styles.wmModal}
          centered
          mask={{ closable: false }}
          footer={null}
        >
          <div className={styles.wmHeader}>
            <div className={styles.wmHeaderLeft}>
              <div className={styles.wmAvatar}>{wsName.charAt(0).toUpperCase()}</div>
              <div className={styles.wmHeaderInfo}>
                <div className={styles.wmHeaderTitle}>Thành viên {wsName}</div>
              </div>
            </div>
            <Button
              type="primary"
              className={styles.wmInviteBtn}
              icon={<UserPlus size={16} />}
              onClick={() => inviteMemberWorkspaceModal.current?.openModal(wsId)}
            >
              Mời thành viên
            </Button>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as "pending" | "members")}
            className={styles.wmTabs}
            items={tabsItems}
          />

          <div className={styles.wmBody}>
            {activeTab === "members" && (
              <>
                <div className={styles.wmFilters}>
                  <Input
                    placeholder="Tìm kiếm theo tên, username..."
                    prefix={<Search size={16} style={{ color: "var(--color-text-secondary)" }} />}
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className={styles.wmSearch}
                    allowClear
                  />
                </div>

                {isLoadingMembersWorkspace && membersWorkspace.length === 0 ? (
                  <div className={styles.wmLoading}>
                    <Spin size="medium" tip="Loading..." />
                  </div>
                ) : membersWorkspace.length > 0 ? (
                  <>
                    <div className={styles.wmMemberList}>
                      {membersWorkspace.map((member) => (
                        <MemberItem
                          key={member.id}
                          member={member}
                          buildMemberMenuItems={buildMemberMenuItems}
                          userId={userId as string}
                        />
                      ))}
                    </div>

                    {hasMore && (
                      <div className={styles.wmLoadMore}>
                        <Button
                          type="default"
                          onClick={handleLoadMore}
                          loading={isLoadingMembersWorkspace}
                          icon={<ChevronDown size={16} />}
                          block
                        >
                          Xem thêm thành viên
                        </Button>
                        <div className={styles.wmLoadMoreHint}>
                          Đang hiển thị {membersWorkspace.length} / {totalMembers} thành viên
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Empty description="Không tìm thấy thành viên nào" style={{ marginTop: 48 }} />
                )}
              </>
            )}

            {activeTab === "pending" && (
              <div className={styles.wmPendingList}>
                {isLoadingMemberRequestsWorkspace ? (
                  <div className={styles.wmPendingLoading}>
                    <Spin />
                  </div>
                ) : requestsWorkspace.length === 0 ? (
                  <Empty description="Không có yêu cầu nào đang chờ" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <>
                    <div className={styles.wmPendingSummary}>
                      <span>
                        Lời mời: <strong>{inviteCount}</strong>
                      </span>
                      <span>
                        Yêu cầu tham gia: <strong>{joinCount}</strong>
                      </span>
                    </div>
                    {requestsWorkspace.map((request) => {
                      const displayName = request.fullName || request.username || "Người dùng";
                      const isInvite = request.type === "invite";
                      return (
                        <div key={request.userId} className={styles.wmPendingItem}>
                          <AvatarFallback
                            src={request.avatar}
                            alt={displayName}
                            size={40}
                            showStatus={false}
                          />
                          <div className={styles.wmMemberInfo}>
                            <div className={styles.wmMemberName}>{displayName}</div>
                            <div className={styles.wmMemberEmail}>
                              @{request.username}
                              {isInvite && request.invitedByName && (
                                <span> · mời bởi {request.invitedByName}</span>
                              )}
                              {!isInvite && request.requestedById && <span> · yêu cầu tham gia</span>}
                            </div>
                          </div>
                          <span
                            className={`${styles.wmMemberRole} ${
                              isInvite ? styles.wmRoleInvite : styles.wmRoleJoin
                            }`}
                          >
                            {isInvite ? "Lời mời" : "Xin vào"}
                          </span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>
        </Modal>

        <InviteMemberWorkspaceModal ref={inviteMemberWorkspaceModal} />

        <ProfileModal ref={profileModalRef} />
      </>
    );
  },
);

export default WorkspaceMemberModal;
