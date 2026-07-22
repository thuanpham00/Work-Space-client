import { Button, Spin } from "antd";
import styles from "./SidebarFriend.module.scss";
import { useContext } from "react";
import { List, Plus } from "lucide-react";
import { FriendContext, type ModeListFriend } from "../../FriendPage";
import { useQuery } from "react-query";
import { useAppStore } from "../../../../store/store";
import { channelApi } from "../../../../apis/channel.api";
import type { ChannelDM } from "../../../../types/channel.type";

const ChannelItem = ({
  channel,
  setModeListFriend,
}: {
  channel: ChannelDM;
  setModeListFriend: (value: ModeListFriend) => void;
}) => {
  const member = Array.isArray(channel.members) ? channel.members[0] : channel.members;
  const user = member?.user;

  const displayName = user?.displayName || user?.fullName || user?.username || channel.name || "Người dùng";
  const avatar = user?.avatar;
  const bio = user?.bio;
  const status = (user?.status || "OFFLINE").toUpperCase();

  const statusClass =
    status === "ONLINE"
      ? styles.statusOnline
      : status === "IDLE" || status === "AWAY"
        ? styles.statusIdle
        : status === "DND"
          ? styles.statusDnd
          : styles.statusOffline;

  const avatarLetter = displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <button className={styles.friendItem} onClick={() => setModeListFriend("chat")}>
      <div className={styles.avatarWrapper}>
        {avatar ? (
          <img src={avatar} alt={displayName} className={styles.friendAvatar} />
        ) : (
          <div className={styles.avatarFallback}>{avatarLetter}</div>
        )}
        <span className={`${styles.statusDot} ${statusClass}`} />
      </div>
      <div className={styles.friendInfo}>
        <span className={styles.friendItemName}>{displayName}</span>
        {bio && <span className={styles.friendSubtext}>{bio}</span>}
      </div>
    </button>
  );
};

export default function SidebarFriend() {
  const { setModeListFriend, modeListFriend } = useContext(FriendContext);
  const accessToken = useAppStore((app) => app.accessToken);

  const { data: dataChannelDM, isLoading } = useQuery({
    queryKey: ["channel-DM", accessToken],
    queryFn: () => channelApi.getDirectMessageChannels(),
    staleTime: 1000 * 60 * 15, // 15 minutes
    keepPreviousData: true,
    enabled: Boolean(accessToken),
  });

  const listChannelDM = (dataChannelDM?.data?.data.channels || []) as ChannelDM[];

  return (
    <div className={styles.layoutInner}>
      <Button
        type="link"
        onClick={() => setModeListFriend("list")}
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
        ) : listChannelDM.length === 0 ? (
          <div className="text-center text-xs text-gray-500 py-4">Chưa có tin nhắn trực tiếp nào</div>
        ) : (
          listChannelDM.map((channel) => (
            <ChannelItem key={channel.id} channel={channel} setModeListFriend={setModeListFriend} />
          ))
        )}
      </div>
    </div>
  );
}
