import AvatarFallback from "../AvatarFallback/AvatarFallback";
import type { StatusUser } from "../../types/friend.type";
import styles from "./FriendCard.module.scss";
import { useUserStore } from "../../store/userStore";
import type { LastMessageType } from "../../types/message.type";

interface FriendCardProps {
  displayName: string;
  avatar: string;
  status: StatusUser;
  selectedChannel?: string;
  channelId?: string;
  showStatus: boolean;
  username?: string;
  lastMessage: LastMessageType | null;
}

export default function FriendCard({
  displayName,
  avatar,
  status,
  selectedChannel,
  channelId,
  username,
  showStatus = false,
  lastMessage,
}: FriendCardProps) {
  const userId = useUserStore((app) => app.user?.id);
  const isMe = userId === lastMessage?.senderId;
  return (
    <div className={`${styles.friendItem} ${selectedChannel === channelId ? styles.friendItemActive : ""}`}>
      <AvatarFallback src={avatar} alt={displayName} status={status as StatusUser} showStatus={showStatus} />

      <div className={styles.friendInfo}>
        <span className={styles.friendItemName}>{displayName}</span>
        {username && <span className={styles.friendItemUserName}>@{username}</span>}
        {lastMessage !== null ? (
          <span className={styles.friendItemLastMessage}>
            {isMe ? "Bạn: " : ""}
            {lastMessage.content}
          </span>
        ) : (
          <span className={styles.friendItemLastMessage}>Chưa có tin nhắn nào</span>
        )}
      </div>
    </div>
  );
}
