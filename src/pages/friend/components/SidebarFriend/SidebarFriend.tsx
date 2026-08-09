import { Button, Spin } from "antd";
import styles from "./SidebarFriend.module.scss";
import { List, Plus } from "lucide-react";
import { useQuery } from "react-query";
import { friendApi } from "../../../../apis/friend.api";
import type { FriendResponse, StatusUser } from "../../../../types/friend.type";
import { modeListFriend, useChannelStore } from "../../../../store/channelStore";
import { useUserStore } from "../../../../store/userStore";
import { useState } from "react";
import FriendCard from "../../../../components/FriendCard/FriendCard";
import { StatusRequest } from "../../../../types/user.type";

const FriendItem = ({
  friend,
  selectedFriend,
  setSelectedFriend,
}: {
  friend: FriendResponse;
  selectedFriend: string;
  setSelectedFriend: (friendId: string) => void;
}) => {
  const chooseChannelFriend = useChannelStore((app) => app.chooseChannelFriend);

  const displayName = friend.displayName || friend.fullName || friend.username || "Người dùng";
  const avatar = friend.avatar;
  const status = (friend?.status || "OFFLINE").toUpperCase();

  return (
    <button
      className="w-full"
      onClick={() => {
        setSelectedFriend(friend.id);
        chooseChannelFriend(friend.id, modeListFriend.chat);
      }}
    >
      <FriendCard
        displayName={displayName}
        avatar={avatar}
        status={status as StatusUser}
        selectedFriend={selectedFriend}
        friendId={friend.id}
        showStatus={true}
      />
    </button>
  );
};

export default function SidebarFriend() {
  const chooseChannelFriend = useChannelStore((app) => app.chooseChannelFriend);
  const [selectedFriend, setSelectedFriend] = useState<string>("");

  const modeListFriendState = useChannelStore((app) => app.modeListFriend);
  const accessToken = useUserStore((app) => app.accessToken);

  const { data: dataFriends, isLoading } = useQuery({
    queryKey: ["friends", accessToken],
    queryFn: () => friendApi.getFriends({ status: StatusRequest.ACCEPTED, search: "" }),
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
          chooseChannelFriend("", modeListFriend.list);
          setSelectedFriend("");
        }}
        className={`${styles.buttonListFriend} ${modeListFriendState === "list" ? styles.buttonListFriendActive : ""}`}
        icon={<List size={16} />}
      >
        Danh sách bạn bè
      </Button>

      <div className="w-full h-0.5 bg-gray-500 my-2!"></div>

      <div className="flex items-center justify-between mb-1! w-full px-2">
        <h2 className={styles.layoutInnerTitleChat}>Tin nhắn trực tiếp</h2>
        <Button type="link" className="p-0!" title="Bắt đầu cuộc trò chuyện">
          <Plus size={16} />
        </Button>
      </div>

      <div className={styles.layoutList}>
        {isLoading ? (
          <div className="flex items-center justify-center py-4 w-full">
            <Spin size="small" />
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center text-xs text-gray-500 py-4">Chưa có tin nhắn trực tiếp nào</div>
        ) : (
          friends.map((friend) => (
            <FriendItem
              key={friend.id}
              friend={friend}
              selectedFriend={selectedFriend}
              setSelectedFriend={setSelectedFriend}
            />
          ))
        )}
      </div>
    </div>
  );
}
