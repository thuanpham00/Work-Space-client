import { Button, Spin } from "antd";
import styles from "./SidebarFriend.module.scss";
import { List, Plus } from "lucide-react";
import { type ModeListFriend } from "../../FriendPage";
import { useQuery } from "react-query";
import { friendApi } from "../../../../apis/friend.api";
import { StatusList } from "../StatusUser/StatusUsers";
import type { FriendResponse } from "../../../../types/friend.type";
import AvatarFallback from "../../../../components/AvatarFallback/AvatarFallback";
import { useChannelStore } from "../../../../store/channelStore";
import { useUserStore } from "../../../../store/userStore";

const FriendItem = ({ friend }: { friend: FriendResponse }) => {
  const setModeListFriend = useChannelStore((app) => app.setModeListFriend);
  const setFriendId = useChannelStore((app) => app.setFriendId);

  const displayName = friend.displayName || friend.fullName || friend.username || "Người dùng";
  const avatar = friend.avatar;
  const status = (friend?.status || "OFFLINE").toUpperCase();

  return (
    <button
      className={styles.friendItem}
      onClick={() => {
        setModeListFriend("chat" as ModeListFriend);
        setFriendId(friend.id);
      }}
    >
      <AvatarFallback src={avatar} alt={displayName} status={status as any} showStatus={true} />

      <div className={styles.friendInfo}>
        <span className={styles.friendItemName}>{displayName}</span>
      </div>
    </button>
  );
};

export default function SidebarFriend() {
  const setFriendId = useChannelStore((app) => app.setFriendId);
  const setChannelId = useChannelStore((app) => app.setChannelId);
  const setModeListFriend = useChannelStore((app) => app.setModeListFriend);

  const modeListFriend = useChannelStore((app) => app.modeListFriend);
  const accessToken = useUserStore((app) => app.accessToken);

  const { data: dataFriends, isLoading } = useQuery({
    queryKey: ["friends", accessToken],
    queryFn: () => friendApi.getFriends({ status: StatusList.ACCEPTED, search: "" }),
    staleTime: 1000 * 60 * 15, // 15 minutes
    keepPreviousData: true,
    enabled: Boolean(accessToken),
  });

  const friends = (dataFriends?.data.data.friends ?? []) as FriendResponse[];

  return (
    <div className={styles.layoutInner}>
      <Button
        type="link"
        onClick={() => {
          setModeListFriend("list" as ModeListFriend);
          setFriendId(null);
          setChannelId(null);
        }}
        className={`${styles.buttonListFriend} ${modeListFriend === "list" ? styles.buttonListFriendActive : ""}`}
        icon={<List size={16} />}
      >
        Danh sách bạn bè
      </Button>

      <div className="w-full h-0.5 bg-gray-500 my-2!"></div>

      <div className="flex items-center justify-between mb-3! w-full px-2">
        <h2 className={styles.layoutInnerTitleChat}>Tin nhắn trực tiếp</h2>
        <button className={styles.addChatButton} title="Bắt đầu cuộc trò chuyện">
          <Plus size={16} />
        </button>
      </div>

      <div className={styles.layoutList}>
        {isLoading ? (
          <div className="flex items-center justify-center py-4 w-full">
            <Spin size="small" />
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center text-xs text-gray-500 py-4">Chưa có tin nhắn trực tiếp nào</div>
        ) : (
          friends.map((friend) => <FriendItem key={friend.id} friend={friend} />)
        )}
      </div>
    </div>
  );
}
