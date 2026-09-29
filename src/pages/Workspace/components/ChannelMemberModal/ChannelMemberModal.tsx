/* eslint-disable react-hooks/set-state-in-effect */
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Button, Empty, Input, Modal, Spin, Tabs } from "antd";
import { Search, ChevronDown } from "lucide-react";
import styles from "./ChannelMemberModal.module.scss";
import type { QueryBase } from "../../../../types/query.type";
import AvatarFallback from "../../../../components/AvatarFallback/AvatarFallback";
import { useDebounce } from "../../../../Hooks/useDebounce";
import { useChannelStore } from "../../../../store/channelStore";
import { ChannelMemberRole, type ChannelMember } from "../../../../types/channel.type";
import { channelApi } from "../../../../apis/channel.api";
import { useQuery } from "react-query";

export interface WorkspaceMemberModalRef {
  handleOpen: () => void;
}

const PAGE_SIZE = 10;

const MemberItem = ({ member }: { member: ChannelMember }) => {
  const displayName = member.fullName || member.username || "Người dùng";
  return (
    <div className={styles.wmMemberItem}>
      <AvatarFallback src={member.avatar} alt={displayName} size={40} showStatus={false} />
      <div className={styles.wmMemberInfo}>
        <div className={styles.wmMemberName}>{displayName}</div>
        <div className={styles.wmMemberEmail}>@{member.username}</div>
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

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState<QueryBase>({ page: 1, limit: PAGE_SIZE, search: "" });

  const debouncedSearchKeyword = useDebounce(searchKeyword, 500);

  useEffect(() => {
    setQuery((prev) => ({ ...prev, search: debouncedSearchKeyword }));
  }, [debouncedSearchKeyword]);

  useImperativeHandle(ref, () => ({
    handleOpen: () => {
      setOpen(true);
      setActiveTab("invite");
      setSearchKeyword("");
      setPage(1);
      setQuery({ page: 1, limit: PAGE_SIZE, search: "" });
    },
  }));

  const { data: dataFriendInvite, isLoading: isLoadingMemberRequestsWorkspace } = useQuery({
    queryKey: ["friendInviteChannel", channelId, query],
    queryFn: () => channelApi.getFriendsInviteChannel(channelId, query),
    enabled: Boolean(channelId) && open,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });

  const friendInvite = dataFriendInvite?.data.data.friends ?? [];
  const total = dataFriendInvite?.data.data.total ?? 0;
  const totalPages = dataFriendInvite?.data.data.total_page ?? 1;
  const hasMore = page < totalPages;

  // const { data: dataMemberRequestsWorkspace, isLoading: isLoadingMemberRequestsWorkspace } = useQuery({
  //   queryKey: ["memberRequestsWorkspace", wsId],
  //   queryFn: () => workspaceAPI.getMemberWorkspaceRequests(wsId),
  //   enabled: Boolean(wsId) && open && (isOwner || isAdmin), // chỉ owner/admin mới xem được yêu cầu
  //   keepPreviousData: true,
  // });

  // const requestsResponse = dataMemberRequestsWorkspace?.data.data;
  // const requestsWorkspace = useMemo<WorkspaceRequestItem[]>(
  //   () => requestsResponse?.requests ?? [],
  //   [requestsResponse?.requests],
  // );
  // const inviteCount = requestsResponse?.inviteCount ?? 0;
  // const joinCount = requestsResponse?.joinCount ?? 0;

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setQuery((prev) => ({ ...prev, page: nextPage }));
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
        width={760}
        className={styles.wmModal}
        centered
        mask={{ closable: false }}
        footer={null}
      >
        <div className={styles.wmHeader}>
          <div className={styles.wmHeaderLeft}>
            <div className={styles.wmHeaderInfo}>
              <div className={styles.wmHeaderTitle}>Thêm thành viên vào kênh {channelName}</div>
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

              {isLoadingMemberRequestsWorkspace && friendInvite.length === 0 ? (
                <div className={styles.wmLoading}>
                  <Spin size="medium" tip="Loading..." />
                </div>
              ) : friendInvite.length > 0 ? (
                <>
                  <div className={styles.wmMemberList}>
                    {friendInvite.map((member) => (
                      <MemberItem key={member.userId} member={member} />
                    ))}
                  </div>

                  {hasMore && (
                    <div className={styles.wmLoadMore}>
                      <Button
                        type="default"
                        onClick={handleLoadMore}
                        loading={isLoadingMemberRequestsWorkspace}
                        icon={<ChevronDown size={16} />}
                        block
                      >
                        Xem thêm thành viên
                      </Button>
                      <div className={styles.wmLoadMoreHint}>
                        Đang hiển thị {friendInvite.length} / {total} thành viên
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Empty description="Không tìm thấy thành viên nào" style={{ marginTop: 48 }} />
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
