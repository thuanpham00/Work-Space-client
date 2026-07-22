import { Button, Empty, Input, Spin, Tabs, type TabsProps, Modal, message } from "antd";
import styles from "./StatusUsers.module.scss";
import {
  Check,
  Loader,
  MessageCircleMore,
  MoreVertical,
  Plus,
  Search,
  Send,
  UsersRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { getAccessTokenFromLS } from "../../../../utils/auth";
import { friendApi } from "../../../../apis/friend.api";
import { useMutation, useQuery } from "react-query";
import { useDebounce } from "../../../../Hooks/useDebounce";
import { queryClient } from "../../../../main";

const StatusList = {
  ONLINE: "ONLINE",
  ACCEPTED: "ACCEPTED",
  REQUESTED: "REQUEST_SENT",
  RECEIVED: "REQUEST_RECEIVED",
} as const;

export type Status = (typeof StatusList)[keyof typeof StatusList];

type FriendCard = {
  id: string;
  username?: string;
  displayName?: string;
  fullName?: string;
  avatar?: string | null;
};

const statusLabel: Record<Status, string> = {
  [StatusList.ONLINE]: "Trực tuyến",
  [StatusList.ACCEPTED]: "Tất cả",
  [StatusList.REQUESTED]: "Đã gửi yêu cầu",
  [StatusList.RECEIVED]: "Chờ xác nhận",
};

function getDisplayName(friend: FriendCard) {
  return friend.displayName || friend.fullName || friend.username || "";
}

function getAvatarLetter(friend: FriendCard) {
  const source = getDisplayName(friend).trim();

  return source ? source.charAt(0).toUpperCase() : "?";
}

function FriendRow({
  friend,
  status,
  onAccept,
  onReject,
}: {
  friend: FriendCard;
  status: Status;
  onAccept: (friendId: string, name: string) => void;
  onReject: (friendId: string, name: string) => void;
}) {
  const avatar = friend.avatar?.trim();
  const displayName = getDisplayName(friend);
  const isReceived = status === StatusList.RECEIVED;
  const isRequested = status === StatusList.REQUESTED;

  return (
    <div className={styles.friendRow}>
      <div className={styles.friendIdentity}>
        <div className={styles.friendAvatarWrap}>
          {avatar ? (
            <img className={styles.friendAvatar} src={avatar} alt={displayName} />
          ) : (
            <div className={styles.friendAvatarFallback}>{getAvatarLetter(friend)}</div>
          )}
        </div>

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
              onClick={() => onAccept(friend.id, displayName)}
            >
              Chấp nhận
            </Button>
            <Button size="small" icon={<X size={14} />} onClick={() => onReject(friend.id, displayName)}>
              Từ chối
            </Button>
          </>
        ) : isRequested ? (
          <Button size="small">Đã gửi</Button>
        ) : (
          <>
            <Button type="text" size="small" icon={<MessageCircleMore size={16} />} />
            <Button type="text" size="small" icon={<MoreVertical size={16} />} />
          </>
        )}
      </div>
    </div>
  );
}

function FriendStatusPanel({
  status,
  friends,
  isLoading,
  search,
  onSearchChange,
  onAccept,
  onReject,
}: {
  status: Status;
  friends: FriendCard[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onAccept: (friendId: string, name: string) => void;
  onReject: (friendId: string, name: string) => void;
}) {
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
        <span>{friends.length}</span>
      </div>

      {isLoading ? (
        <div className={styles.stateBox}>
          <Spin />
        </div>
      ) : friends.length === 0 ? (
        <div className={styles.stateBox}>
          <Empty description="Không có bạn bè trong mục này" />
        </div>
      ) : (
        <div className={styles.friendList}>
          {friends.map((friend) => (
            <FriendRow
              key={friend.id}
              friend={friend}
              status={status}
              onAccept={onAccept}
              onReject={onReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function StatusUsers({ openModalAddFriend }: { openModalAddFriend: () => void }) {
  const [type, setType] = useState<Status>(StatusList.ACCEPTED);
  const [search, setSearch] = useState("");
  const accessToken = getAccessTokenFromLS();

  const onChange = (key: string) => {
    setType(key as Status);
  };

  const debouncedSearch = useDebounce(search, 500);

  // đưa các biến type, accessToken, debouncedSearch vào queryKey để khi các biến này thay đổi thì query sẽ được gọi lại // như dependencies của useEffect
  const { data: dataFriends, isLoading } = useQuery({
    queryKey: ["friends", type, accessToken, debouncedSearch],
    queryFn: () => friendApi.getFriends({ status: type, search: debouncedSearch }),
    staleTime: 1000 * 60 * 15, // 15 minutes
    keepPreviousData: true,
    enabled: Boolean(accessToken),
  });

  const friends = (dataFriends?.data.data.friends ?? []) as FriendCard[];

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
      setConfirmRejectOpen(false);
      setSelectedFriend(null);
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi từ chối kết bạn");
    }
  };

  const items: TabsProps["items"] = [
    {
      key: StatusList.ACCEPTED,
      label: (
        <div className="flex items-center gap-2">
          <UsersRound size={16} />
          <span>Tất cả</span>
        </div>
      ),
      children: (
        <FriendStatusPanel
          status={StatusList.ACCEPTED}
          friends={friends}
          isLoading={isLoading}
          search={search}
          onSearchChange={setSearch}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      ),
    },
    {
      key: StatusList.ONLINE,
      label: (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Online</span>
        </div>
      ),
      children: <div>1</div>,
    },
    {
      key: StatusList.REQUESTED,
      label: (
        <div className="flex items-center gap-2">
          <Send size={16} /> <span>Đã gửi yêu cầu</span>
        </div>
      ),
      children: (
        <FriendStatusPanel
          status={StatusList.REQUESTED}
          friends={friends}
          isLoading={isLoading}
          search={search}
          onSearchChange={setSearch}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      ),
    },
    {
      key: StatusList.RECEIVED,
      label: (
        <div className="flex items-center gap-2">
          <Loader size={16} />
          <span>Chờ xác nhận</span>
        </div>
      ),
      children: (
        <FriendStatusPanel
          status={StatusList.RECEIVED}
          friends={friends}
          isLoading={isLoading}
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
