/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Empty, Input, Spin, Tabs, App } from "antd";
import styles from "./StatusUsers.module.scss";
import { Check, Loader, Plus, Search, Send, UsersRound, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { friendApi } from "../../../../apis/friend.api";
import { useMutation, useQuery } from "react-query";
import { useDebounce } from "../../../../Hooks/useDebounce";
import { queryClient } from "../../../../main";
import { StatusUser, type FriendDMChannelResponse, type FriendResponse } from "../../../../types/friend.type";
import AvatarFallback from "../../../../components/AvatarFallback/AvatarFallback";
import { modeListFriend, useChannelStore } from "../../../../store/channelStore";
import { StatusRequest } from "../../../../types/user.type";
import { useUserStore } from "../../../../store/userStore";
import { useNavigate } from "react-router-dom";
import { ProfileModal, type ProfileModalRef } from "../ProfileModal/ProfileModal";

const userStatusLabel: Record<StatusUser, string> = {
  [StatusUser.ONLINE]: "Trực tuyến",
  [StatusUser.BUSY]: "Bận",
  [StatusUser.OFFLINE]: "Offline",
};

export function FriendChannelRow({ channelFriend }: { channelFriend: FriendDMChannelResponse }) {
  const chooseChannelFriend = useChannelStore((app) => app.chooseChannelFriend);
  const friend = channelFriend.friend;

  if (!friend) return null;

  const avatar = friend.avatar || "";
  const displayName = friend.fullName || friend.username || "";
  const subtext = friend.username
    ? `@${friend.username}`
    : (userStatusLabel[friend.status as StatusUser] ?? "");

  return (
    <div
      className={styles.friendRow}
      onClick={() => {
        chooseChannelFriend(channelFriend.channelId, channelFriend.name || "", modeListFriend.chat);
      }}
    >
      <div className={styles.friendIdentity}>
        <AvatarFallback src={avatar} alt={displayName} showStatus={false} />

        <div className={styles.friendMeta}>
          <div className={styles.friendName}>{displayName}</div>
          <div className={styles.friendSubtext}>{subtext}</div>
        </div>
      </div>
    </div>
  );
}

export function FriendStatusRow({
  friend,
  status,
  onAccept,
  onReject,
  onUserClick,
}: {
  friend: FriendResponse;
  status?: StatusRequest;
  onAccept?: (friendId: string, name: string) => void;
  onReject?: (friendId: string, name: string) => void;
  onUserClick?: (userId: string) => void;
}) {
  const avatar = friend.avatar || "";
  const displayName = friend.fullName || "";
  const username = friend.username || "";
  const isReceived = status === StatusRequest.RECEIVED;
  const isRequested = status === StatusRequest.REQUESTED;

  return (
    <div className={styles.friendRow} onClick={() => onUserClick?.(friend.id)}>
      <div className={styles.friendIdentity}>
        <AvatarFallback src={avatar} alt={displayName} showStatus={false} />

        <div className={styles.friendMeta}>
          <div className={styles.friendName}>{displayName}</div>
          <div className={styles.friendSubtext}>@{username}</div>
        </div>
      </div>

      <div className={styles.friendActions}>
        {isReceived ? (
          <>
            <Button
              type="primary"
              size="small"
              icon={<Check size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                onAccept?.(friend.id, displayName);
              }}
            >
              Chấp nhận
            </Button>
            <Button
              size="small"
              icon={<X size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                onReject?.(friend.id, displayName);
              }}
            >
              Từ chối
            </Button>
          </>
        ) : isRequested ? (
          <Button size="small">Đã gửi</Button>
        ) : null}
      </div>
    </div>
  );
}

function FriendStatusPanel({
  status,
  friends = [],
  channelsFriends = [],
  isLoading,
  search,
  onSearchChange,
  onAccept,
  onReject,
  type,
  onUserClick,
}: {
  status: StatusRequest;
  friends?: FriendResponse[];
  channelsFriends?: FriendDMChannelResponse[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onAccept?: (friendId: string, name: string) => void;
  onReject?: (friendId: string, name: string) => void;
  type: "statusFriends" | "channelFriends";
  onUserClick?: (userId: string) => void;
}) {
  const listLength = type === "statusFriends" ? friends.length : channelsFriends.length;

  if (isLoading) {
    return (
      <div className={styles.stateBox}>
        <Spin size="medium" tip="Loading..." />
      </div>
    );
  }

  if (listLength === 0) {
    return (
      <div className={styles.stateBox}>
        <Empty description="Không có bạn bè trong mục này" />
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.searchBar}>
        <Input
          allowClear
          size="large"
          prefix={<Search size={16} />}
          placeholder="Tìm kiếm"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className={styles.friendList}>
        {type === "statusFriends" &&
          friends.map((friend) => (
            <FriendStatusRow
              key={friend.id}
              friend={friend}
              status={status}
              onAccept={onAccept}
              onReject={onReject}
              onUserClick={onUserClick}
            />
          ))}

        {type === "channelFriends" &&
          channelsFriends.map((channelFriend) => (
            <FriendChannelRow key={channelFriend.channelId} channelFriend={channelFriend} />
          ))}
      </div>
    </div>
  );
}

export default function StatusUsers() {
  const { message } = App.useApp();
  const [type, setType] = useState<StatusRequest>(StatusRequest.ACCEPTED);
  const [search, setSearch] = useState("");
  const accessToken = useUserStore((state) => state.accessToken);
  const navigate = useNavigate();
  const profileModalRef = useRef<ProfileModalRef>(null);

  const { data: dataCountStatusFriends } = useQuery({
    queryKey: ["countStatusFriends", accessToken],
    queryFn: () => friendApi.getCountStatusFriends(),
    staleTime: 1000 * 60 * 15, // 15 minutes
    enabled: Boolean(accessToken),
  });

  const statusFriendsCount = useMemo(() => {
    return {
      accepted: dataCountStatusFriends?.data.data.accepted ?? 0,
      received: dataCountStatusFriends?.data.data.received ?? 0,
      sent: dataCountStatusFriends?.data.data.sent ?? 0,
    };
  }, [dataCountStatusFriends?.data.data]);

  const onChange = (key: string) => {
    setType(key as StatusRequest);
  };

  const debouncedSearch = useDebounce(search, 500);

  // đưa các biến type, accessToken, debouncedSearch vào queryKey để khi các biến này thay đổi thì query sẽ được gọi lại // như dependencies của useEffect
  const { data: dataFriendStatus, isLoading: isLoadingFriendStatus } = useQuery({
    queryKey: ["friends", type, accessToken, debouncedSearch],
    queryFn: () => friendApi.getStatusFriends({ status: type, search: debouncedSearch }),
    staleTime: 1000 * 60 * 15, // 15 minutes
    keepPreviousData: true,
    enabled: Boolean(accessToken) && type !== StatusRequest.ONLINE && type !== StatusRequest.ACCEPTED,
  });

  const { data: dataChannelsFriends, isLoading: isLoadingChannelsFriends } = useQuery({
    queryKey: ["friendsChannels", type, accessToken, debouncedSearch],
    queryFn: () => friendApi.getChannelsFriends({ search: debouncedSearch }),
    staleTime: 1000 * 60 * 15, // 15 minutes
    keepPreviousData: true,
    enabled: Boolean(accessToken) && (type === StatusRequest.ACCEPTED || type === StatusRequest.ONLINE),
  });

  const friendsData = (dataFriendStatus?.data.data.friends ?? []) as FriendResponse[];
  const channelsFriendsData = (dataChannelsFriends?.data.data.channels ?? []) as FriendDMChannelResponse[];
  const onlineChannelsFriends = channelsFriendsData.filter(
    (channel) => channel.friend?.status === StatusUser.ONLINE,
  );

  const acceptedFriend = useMutation({
    mutationFn: (friendId: string) => friendApi.acceptFriend(friendId),
  });

  const rejectedFriend = useMutation({
    mutationFn: (friendId: string) => friendApi.rejectedFriend(friendId),
  });

  const refreshQuery = () => {
    queryClient.invalidateQueries({ queryKey: ["friends"] });
    queryClient.invalidateQueries({ queryKey: ["friendsChannels"] });
    queryClient.invalidateQueries({ queryKey: ["countStatusFriends"] });
  };

  const handleConfirmAccept = async (friendId: string, name: string) => {
    try {
      await acceptedFriend.mutateAsync(friendId);
      message.success(`Đã đồng ý kết bạn với ${name}`);
      refreshQuery();
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi đồng ý kết bạn");
    }
  };

  const handleConfirmReject = async (friendId: string, name: string) => {
    try {
      await rejectedFriend.mutateAsync(friendId);
      message.success(`Đã từ chối kết bạn với ${name}`);
      refreshQuery();
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi từ chối kết bạn");
    }
  };

  const handleUserClick = (userId: string) => {
    profileModalRef.current?.openModal(userId);
  };

  const items = useMemo(
    () => [
      {
        key: StatusRequest.ACCEPTED,
        label: (
          <div className="flex items-center gap-2">
            <UsersRound size={16} />
            <span>Tất cả ({statusFriendsCount.accepted})</span>
          </div>
        ),
        children: (
          <FriendStatusPanel
            status={StatusRequest.ACCEPTED}
            channelsFriends={channelsFriendsData}
            type={"channelFriends"}
            isLoading={isLoadingChannelsFriends}
            search={search}
            onSearchChange={setSearch}
          />
        ),
      },
      {
        key: StatusRequest.ONLINE,
        label: (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Online</span>
          </div>
        ),
        children: (
          <FriendStatusPanel
            status={StatusRequest.ONLINE}
            channelsFriends={onlineChannelsFriends}
            type="channelFriends"
            isLoading={isLoadingChannelsFriends}
            search={search}
            onSearchChange={setSearch}
          />
        ),
      },
      {
        key: StatusRequest.REQUESTED,
        label: (
          <div className="flex items-center gap-2">
            <Send size={16} /> <span>Đã gửi yêu cầu ({statusFriendsCount.sent})</span>
          </div>
        ),
        children: (
          <FriendStatusPanel
            status={StatusRequest.REQUESTED}
            friends={friendsData}
            type={"statusFriends"}
            isLoading={isLoadingFriendStatus}
            search={search}
            onSearchChange={setSearch}
            onUserClick={handleUserClick}
          />
        ),
      },
      {
        key: StatusRequest.RECEIVED,
        label: (
          <div className="flex items-center gap-2">
            <Loader size={16} />
            <span>Chờ xác nhận ({statusFriendsCount.received})</span>
          </div>
        ),
        children: (
          <FriendStatusPanel
            status={StatusRequest.RECEIVED}
            friends={friendsData}
            type={"statusFriends"}
            isLoading={isLoadingFriendStatus}
            search={search}
            onSearchChange={setSearch}
            onAccept={handleConfirmAccept}
            onReject={handleConfirmReject}
            onUserClick={handleUserClick}
          />
        ),
      },
    ],
    [
      statusFriendsCount,
      channelsFriendsData,
      friendsData,
      search,
      isLoadingFriendStatus,
      isLoadingChannelsFriends,
      onlineChannelsFriends,
    ],
  );

  return (
    <div className={styles.statusUsersInner}>
      <Tabs
        activeKey={type}
        items={items}
        onChange={onChange}
        tabBarExtraContent={{
          right: (
            <Button type="primary" onClick={() => navigate("/search")}>
              <Plus size={16} />
              Thêm bạn
            </Button>
          ),
        }}
        className={styles.tab}
      />

      <ProfileModal ref={profileModalRef} onFriendRequestChange={() => {}} onMessageClick={() => {}} />
    </div>
  );
}
