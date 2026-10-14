/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { App, Button, Empty, Input, Modal, Tabs } from "antd";
import { Clock, Copy, Link as LinkIcon, Search, X } from "lucide-react";
import styles from "./ChannelMemberModal.module.scss";
import type { QueryBase } from "../../../../types/query.type";
import AvatarFallback from "../../../../components/AvatarFallback/AvatarFallback";
import { useDebounce } from "../../../../Hooks/useDebounce";
import { useChannelStore } from "../../../../store/channelStore";
import { ChannelMemberRole } from "../../../../types/channel.type";
import { channelApi } from "../../../../apis/channel.api";
import { useMutation, useQuery, useQueryClient } from "react-query";
import type { UserBasic } from "../../../../types/user.type";
import { LIMIT, PAGE } from "../../../../constants/config";
import Loading from "../../../../components/Loading/Loading";
import { UserPlus } from "lucide-react";
import { WorkspaceMemberStatus } from "../../../../types/workspace.type";

export interface WorkspaceMemberModalRef {
  handleOpen: () => void;
}

const MemberItem = ({
  member,
  channelId,
  onInvited,
}: {
  member: UserBasic;
  channelId: string;
  onInvited: () => void;
}) => {
  const displayName = member.fullName || member.username || "Người dùng";
  const { message } = App.useApp();

  const inviteMutation = useMutation({
    mutationFn: () => channelApi.inviteUserToChannel(channelId, { userId: member.id }),
    onSuccess: () => {
      message.success(`Đã gửi lời mời tới ${displayName}`);
      onInvited();
    },
  });

  const revokeInviteMutation = useMutation({
    mutationFn: () => channelApi.revokeInvite(channelId, member.id),
    onSuccess: () => {
      message.success(`Đã hủy lời mời tới ${displayName}`);
      onInvited();
    },
  });

  const renderAction = () => {
    switch (member.status) {
      case WorkspaceMemberStatus.PENDING_INVITE:
        return (
          <Button
            type="primary"
            className={styles.friendRequestBtn}
            loading={revokeInviteMutation.isLoading}
            onClick={() => revokeInviteMutation.mutate()}
            icon={<X size={14} />}
          >
            Hủy
          </Button>
        );
      case WorkspaceMemberStatus.PENDING_REQUEST:
        return (
          <Button
            type="primary"
            className={styles.friendRequestBtn}
            disabled={true}
            icon={<Clock size={14} />}
          >
            Đợi duyệt
          </Button>
        );
      case null:
      case WorkspaceMemberStatus.LEFT:
      case WorkspaceMemberStatus.CANCELED:
        return (
          <Button
            type="primary"
            className={styles.friendRequestBtn}
            loading={inviteMutation.isLoading}
            onClick={() => inviteMutation.mutate()}
            icon={<UserPlus size={14} />}
          >
            Mời
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.wmMemberItem}>
      <AvatarFallback src={member.avatar} alt={displayName} size={40} showStatus={false} />
      <div className={styles.wmMemberInfo}>
        <div className={styles.wmMemberName}>{displayName}</div>
        <div className={styles.wmMemberEmail}>@{member.username}</div>
      </div>

      {renderAction()}
    </div>
  );
};

const InviteLinkSection = ({ link, expiresAt }: { link: string; expiresAt: string | null }) => {
  const { message } = App.useApp();
  const handleCopyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      message.success("Đã sao chép link mời");
    } catch (error) {
      console.error("Copy failed", error);
      message.error("Lỗi khi sao chép link mời");
    }
  };

  return (
    <div className={styles.inviteLinkWrap}>
      <div className={styles.inviteLinkLabel}>
        <LinkIcon size={16} />
        <span>Link mời</span>
      </div>
      <div className={styles.inviteLinkRow}>
        <Input value={link} readOnly className={styles.inviteLinkInput} />
        <button
          type="button"
          className={styles.inviteLinkCopy}
          onClick={handleCopyInviteLink}
          aria-label="Sao chép link"
        >
          <Copy size={16} />
        </button>
      </div>
      <div className={styles.inviteLinkHint}>
        {expiresAt === null
          ? "Link mời không hết hạn"
          : `Link mời sẽ hết hạn sau ${expiresAt} ngày. Bạn có thể tạo link mới bất cứ lúc nào.`}
      </div>
    </div>
  );
};

const ChannelMemberModal = forwardRef<WorkspaceMemberModalRef>((_, ref) => {
  const channelRole = useChannelStore((app) => app.channelRole);
  const channelId = useChannelStore((app) => app.channelId);
  const channelName = useChannelStore((app) => app.channelName);
  const isAdminChannel = channelRole === ChannelMemberRole.ADMIN;

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"invite" | "members">("invite");
  const [searchKeyword, setSearchKeyword] = useState("");

  const [query, setQuery] = useState<QueryBase>({ page: 1, limit: LIMIT, search: "" });
  const [inviteItems, setInviteItems] = useState<UserBasic[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0 });

  const debouncedSearchKeyword = useDebounce(searchKeyword, 500);

  useEffect(() => {
    setQuery((prev) => ({ ...prev, search: debouncedSearchKeyword }));
  }, [debouncedSearchKeyword]);

  useImperativeHandle(ref, () => ({
    handleOpen: () => {
      setOpen(true);
      setActiveTab("invite");
      setSearchKeyword("");
      setQuery({ page: 1, limit: LIMIT, search: "" });
    },
  }));

  const { data: dataChannelRequestList, isFetching: isFetchingChannelRequestList } = useQuery({
    queryKey: ["ChannelRequestList", channelId],
    queryFn: () => channelApi.getRequestListChannel(channelId),
    enabled: Boolean(channelId) && open,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });

  const { data: dataFriendInvite, isFetching: isFetchingFriendInvite } = useQuery({
    queryKey: ["friendInviteChannel", channelId, query],
    queryFn: () => channelApi.getFriendsInviteChannel(channelId, query),
    enabled: Boolean(channelId) && open,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });

  const friendInvite = dataFriendInvite?.data.data.friends ?? [];
  const totalPages = dataFriendInvite?.data.data.totalPages ?? 1;
  const page = dataFriendInvite?.data.data.page ?? 1;
  const hasMore = pagination.page < pagination.totalPages;

  const queryClient = useQueryClient();
  const handleInvited = () => {
    queryClient.invalidateQueries({ queryKey: ["friendInviteChannel", channelId] });
  };

  const { data: dataLinkInvite } = useQuery({
    queryKey: ["linkInviteChannel", channelId],
    queryFn: () => channelApi.getLinkInviteChannel(channelId),
    enabled: Boolean(channelId) && open,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });

  const linkInvite = dataLinkInvite?.data.data.url ?? "";
  const expiresAt = dataLinkInvite?.data.data.expiresAt ?? null;

  useEffect(() => {
    if (!dataFriendInvite) return;
    if (query.page === PAGE) {
      setInviteItems(friendInvite);
    } else {
      setInviteItems((prev) => [...prev, ...friendInvite]);
    }
    setPagination({ page: page, totalPages: totalPages });
  }, [dataFriendInvite, query.page]);

  const handleLoadMore = () => {
    setQuery((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  const tabsItems = [
    ...(isAdminChannel
      ? [
          {
            key: "invite",
            label: `Mời bạn bè`,
          },
          {
            key: "pending",
            label: `Lời duyệt`,
          },
        ]
      : []),
  ];

  return (
    <>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        width={450}
        className={styles.wmModal}
        centered
        mask={{ closable: false }}
        footer={null}
      >
        <div className={styles.wmHeader}>
          <div className={styles.wmHeaderLeft}>
            <div className={styles.wmHeaderInfo}>
              <div className={styles.wmHeaderTitle}>Mời bạn bè vào kênh {channelName}</div>
            </div>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as "invite" | "members")}
          className={styles.wmTabs}
          items={tabsItems}
        />

        <div className={styles.wmBody}>
          {activeTab === "invite" && (
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

              {isFetchingFriendInvite && inviteItems.length === 0 ? (
                <Loading tip="Đang tải..." size="default" />
              ) : inviteItems.length > 0 ? (
                <>
                  <div className={styles.wmMemberList}>
                    {inviteItems.map((member) => (
                      <MemberItem
                        key={member.id}
                        member={member}
                        channelId={channelId}
                        onInvited={handleInvited}
                      />
                    ))}
                  </div>

                  {hasMore && (
                    <div className={styles.wmLoadMore}>
                      <button
                        className={styles.loadMore}
                        onClick={handleLoadMore}
                        disabled={isFetchingFriendInvite}
                      >
                        {isFetchingFriendInvite ? "Đang tải..." : "Xem thêm"}
                      </button>
                    </div>
                  )}

                  <InviteLinkSection link={linkInvite} expiresAt={expiresAt} />
                </>
              ) : (
                <>
                  <Empty description="Không tìm thấy bạn bè nào" style={{ marginTop: 48 }} />
                  <InviteLinkSection link={linkInvite} expiresAt={expiresAt} />
                </>
              )}
            </>
          )}

          {/* {activeTab === "pending" && (
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
            )} */}
        </div>
      </Modal>
    </>
  );
});

export default ChannelMemberModal;
