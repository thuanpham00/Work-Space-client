import { Button, Spin } from "antd";
import styles from "./SidebarFriend.module.scss";
import { List, Plus } from "lucide-react";
import { useQuery } from "react-query";
import { friendApi } from "../../../../apis/friend.api";
import type { FriendDMChannelResponse, StatusUser } from "../../../../types/friend.type";
import { modeListFriend, useChannelStore } from "../../../../store/channelStore";
import { useUserStore } from "../../../../store/userStore";
import FriendCard from "../../../../components/FriendCard/FriendCard";
import { StatusRequest } from "../../../../types/user.type";

const FriendItem = ({ channelFriend }: { channelFriend: FriendDMChannelResponse }) => {
  const chooseChannelFriend = useChannelStore((app) => app.chooseChannelFriend);
  const channelId = useChannelStore((app) => app.channelId);

  const displayName = channelFriend.friend.fullName || "";
  const avatar = channelFriend.friend.avatar || "";
  const status = channelFriend.friend.status as StatusUser;

  return (
    <button
      className="w-full"
      onClick={() => {
        chooseChannelFriend(channelFriend.channelId, modeListFriend.chat);
      }}
    >
      <FriendCard
        displayName={displayName}
        avatar={avatar}
        status={status as StatusUser}
        selectedChannel={channelId}
        channelId={channelFriend.channelId}
        showStatus={true}
      />
    </button>
  );
};

export default function SidebarFriend() {
  const chooseChannelFriend = useChannelStore((app) => app.chooseChannelFriend);

  const modeListFriendState = useChannelStore((app) => app.modeListFriend);
  const accessToken = useUserStore((app) => app.accessToken);

  const { data: dataChannelsFriends, isLoading } = useQuery({
    queryKey: ["friendsChannels", StatusRequest.ACCEPTED, accessToken, ""],
    queryFn: () => friendApi.getChannelsFriends({ search: "" }),
    staleTime: 1000 * 60 * 15, // 15 minutes
    keepPreviousData: true,
    enabled: Boolean(accessToken),
  });

  const channelsFriends = (dataChannelsFriends?.data.data.channels ?? []) as FriendDMChannelResponse[];

  return (
    <div className={styles.layoutInner}>
      <Button
        type="link"
        onClick={() => {
          chooseChannelFriend("", modeListFriend.list);
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
        ) : channelsFriends.length === 0 ? (
          <div className="text-center text-xs text-gray-500 py-4">Chưa có tin nhắn trực tiếp nào</div>
        ) : (
          channelsFriends.map((channelFriend) => (
            <FriendItem key={channelFriend.channelId} channelFriend={channelFriend} />
          ))
        )}
      </div>
    </div>
  );
}
