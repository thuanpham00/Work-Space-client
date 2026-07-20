import { Button, Empty, Input, Spin, Tabs, type TabsProps } from "antd";
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
import { getAccessTokenFromLS } from "../../../utils/auth";
import { friendApi } from "../../../apis/friend.api";
import { useQuery } from "react-query";
import { useDebounce } from "../../../Hooks/useDebounce";

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

function FriendRow({ friend, status }: { friend: FriendCard; status: Status }) {
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
          {/* <span className={`${styles.friendPresence} ${styles[`friendPresence_${status}`]}`}></span> */}
        </div>

        <div className={styles.friendMeta}>
          <div className={styles.friendName}>{displayName}</div>
          <div className={styles.friendSubtext}>{statusLabel[status]}</div>
        </div>
      </div>

      <div className={styles.friendActions}>
        {isReceived ? (
          <>
            <Button type="primary" size="small" icon={<Check size={14} />}>
              Chấp nhận
            </Button>
            <Button size="small" icon={<X size={14} />}>
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
}: {
  status: Status;
  friends: FriendCard[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
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
            <FriendRow key={friend.id} friend={friend} status={status} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function StatusUsers({ openModalAddFriend }: { openModalAddFriend: () => void }) {
  const [type, setType] = useState<Status>(StatusList.ONLINE);
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

  const items: TabsProps["items"] = [
    {
      key: StatusList.ONLINE,
      label: (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Online</span>
        </div>
      ),
      children: (
        <FriendStatusPanel
          status={StatusList.ONLINE}
          friends={friends}
          isLoading={isLoading}
          search={search}
          onSearchChange={setSearch}
        />
      ),
    },
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
        />
      ),
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
    </div>
  );
}
