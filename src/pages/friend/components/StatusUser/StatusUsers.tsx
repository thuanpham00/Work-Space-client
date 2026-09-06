/* eslint-disable react-refresh/only-export-components */
import { Button, Empty, Input, Spin, Tabs, type TabsProps, Modal, App } from "antd";
import styles from "./StatusUsers.module.scss";
import { Check, Loader, Plus, Search, Send, UsersRound, X } from "lucide-react";
import { useState } from "react";
import { friendApi } from "../../../../apis/friend.api";
import { useMutation, useQuery } from "react-query";
import { useDebounce } from "../../../../Hooks/useDebounce";
import { queryClient } from "../../../../main";
import { StatusUser, type FriendDMChannelResponse, type FriendResponse } from "../../../../types/friend.type";
import AvatarFallback from "../../../../components/AvatarFallback/AvatarFallback";
import { modeListFriend, useChannelStore } from "../../../../store/channelStore";
import { StatusRequest } from "../../../../types/user.type";
import { useUserStore } from "../../../../store/userStore";

const statusLabel: Record<StatusRequest, string> = {
  [StatusRequest.ONLINE]: "Trực tuyến",
  [StatusRequest.ACCEPTED]: "Tất cả",
  [StatusRequest.REQUESTED]: "Đã gửi yêu cầu",
  [StatusRequest.RECEIVED]: "Chờ xác nhận",
};

const userStatusLabel: Record<StatusUser, string> = {
  [StatusUser.ONLINE]: "Trực tuyến",
  [StatusUser.BUSY]: "Bận",
  [StatusUser.OFFLINE]: "Offline",
};

function FriendChannelRow({ channelFriend }: { channelFriend: FriendDMChannelResponse }) {
  const chooseChannelFriend = useChannelStore((app) => app.chooseChannelFriend);
  const friend = channelFriend.friend;

  if (!friend) return null;

  const avatar = friend.avatar || "";
  const displayName = friend.fullName || friend.username || "";
  const subtext = friend.username
    ? `@${friend.username}`
    : userStatusLabel[friend.status as StatusUser] ?? "";

  return (
    <div
      className={styles.friendRow}
      onClick={() => {
        chooseChannelFriend(channelFriend.channelId, modeListFriend.chat);
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

function FriendStatusRow({
  friend,
  status,
  onAccept,
  onReject,
}: {
  friend: FriendResponse;
  status: StatusRequest;
  onAccept: (friendId: string, name: string) => void;
  onReject: (friendId: string, name: string) => void;
}) {
  const avatar = friend.avatar || "";
  const displayName = friend.displayName || friend.fullName || friend.username || "";
  const isReceived = status === StatusRequest.RECEIVED;
  const isRequested = status === StatusRequest.REQUESTED;

  return (
    <div className={styles.friendRow}>
      <div className={styles.friendIdentity}>
        <AvatarFallback src={avatar} alt={displayName} showStatus={false} />

        <div className={styles.friendMeta}>
          <div className={styles.friendName}>{displayName}</div>
          <div className={styles.friendSubtext}>{statusLabel[status]}</div>
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
                onAccept(friend.id, displayName);
              }}
            >
              Chấp nhận
            </Button>
            <Button
              size="small"
              icon={<X size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                onReject(friend.id, displayName);
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
}: {
  status: StatusRequest;
  friends?: FriendResponse[];
  channelsFriends?: FriendDMChannelResponse[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onAccept: (friendId: string, name: string) => void;
  onReject: (friendId: string, name: string) => void;
  type: "statusFriends" | "channelFriends";
}) {
  const listLength = type === "statusFriends" ? friends.length : channelsFriends.length;

  if (isLoading) {
    return (
      <div className={styles.stateBox}>
        <Spin />
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

      <div className={styles.panelHeader}>
        <h3>{statusLabel[status]}</h3>
        <span>{listLength}</span>
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

export default function StatusUsers({ openModalAddFriend }: { openModalAddFriend: () => void }) {
  const { message } = App.useApp();
  const [type, setType] = useState<StatusRequest>(StatusRequest.ACCEPTED);
  const [search, setSearch] = useState("");
  const accessToken = useUserStore((state) => state.accessToken);

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

  const [confirmAcceptOpen, setConfirmAcceptOpen] = useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<{ id: string; name: string } | null>(null);

  const acceptedFriend = useMutation({
    mutationFn: (friendId: string) => friendApi.acceptFriend(friendId),
  });

  const rejectedFriend = useMutation({
    mutationFn: (friendId: string) => friendApi.rejectedFriend(friendId),
  });

  const handleAccept = (friendId: string, name: string) => {
    setSelectedFriend({ id: friendId, name });
    setConfirmAcceptOpen(true);
  };

  const handleReject = (friendId: string, name: string) => {
    setSelectedFriend({ id: friendId, name });
    setConfirmRejectOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (!selectedFriend) return;
    try {
      await acceptedFriend.mutateAsync(selectedFriend.id);
      message.success(`Đã đồng ý kết bạn với ${selectedFriend.name}`);
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friendsChannels"] });
      setConfirmAcceptOpen(false);
      setSelectedFriend(null);
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi đồng ý kết bạn");
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedFriend) return;
    try {
      await rejectedFriend.mutateAsync(selectedFriend.id);
      message.success(`Đã từ chối kết bạn với ${selectedFriend.name}`);
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friendsChannels"] });
      setConfirmRejectOpen(false);
      setSelectedFriend(null);
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi từ chối kết bạn");
    }
  };

  const items: TabsProps["items"] = [
    {
      key: StatusRequest.ACCEPTED,
      label: (
        <div className="flex items-center gap-2">
          <UsersRound size={16} />
          <span>Tất cả</span>
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
          onAccept={handleAccept}
          onReject={handleReject}
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
          onAccept={handleAccept}
          onReject={handleReject}
        />
      ),
    },
    {
      key: StatusRequest.REQUESTED,
      label: (
        <div className="flex items-center gap-2">
          <Send size={16} /> <span>Đã gửi yêu cầu</span>
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
          onAccept={handleAccept}
          onReject={handleReject}
        />
      ),
    },
    {
      key: StatusRequest.RECEIVED,
      label: (
        <div className="flex items-center gap-2">
          <Loader size={16} />
          <span>Chờ xác nhận</span>
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
          onAccept={handleAccept}
          onReject={handleReject}
        />
      ),
    },
  ];

  return (
    <div className={styles.statusUsersInner}>
      <Tabs
        activeKey={type}
        items={items}
        onChange={onChange}
        tabBarExtraContent={{
          right: (
            <Button type="primary" onClick={openModalAddFriend}>
              <Plus size={16} />
              Thêm bạn
            </Button>
          ),
        }}
        className={styles.tab}
      />

      <Modal
        open={confirmAcceptOpen}
        title="Xác nhận kết bạn"
        onCancel={() => {
          setConfirmAcceptOpen(false);
          setSelectedFriend(null);
        }}
        onOk={handleConfirmAccept}
        okText="Đồng ý"
        cancelText="Hủy"
        confirmLoading={acceptedFriend.isLoading}
      >
        <p style={{ marginBottom: 0 }}>
          Bạn có chắc chắn muốn đồng ý kết bạn với <b>{selectedFriend?.name}</b>?
        </p>
      </Modal>

      <Modal
        open={confirmRejectOpen}
        title="Từ chối kết bạn"
        onCancel={() => {
          setConfirmRejectOpen(false);
          setSelectedFriend(null);
        }}
        onOk={handleConfirmReject}
        okText="Từ chối"
        okButtonProps={{ danger: true }}
        cancelText="Hủy"
        confirmLoading={rejectedFriend.isLoading}
      >
        <p style={{ marginBottom: 0 }}>
          Bạn có chắc chắn muốn từ chối kết bạn với <b>{selectedFriend?.name}</b>?
        </p>
      </Modal>
    </div>
  );
}
