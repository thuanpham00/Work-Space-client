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
  hasCount: boolean;
  unreadCount: number;
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
  hasCount,
  unreadCount,
}: FriendCardProps) {
  const userId = useUserStore((app) => app.user?.id);
  const isMe = userId === lastMessage?.senderId;
  const showUnread = hasCount && unreadCount > 0;
  
  const previewText =
    lastMessage && lastMessage.content
      ? lastMessage.content
      : lastMessage?.messageType === "GIF"
        ? "[GIF]"
        : lastMessage
          ? "[Hình ảnh]"
          : null;
  return (
    <div
      className={`${styles.friendItem} ${selectedChannel === channelId ? styles.friendItemActive : ""} ${showUnread ? styles.friendItemHasUnread : ""}`}
    >
      <AvatarFallback src={avatar} alt={displayName} status={status as StatusUser} showStatus={showStatus} />

      <div className={styles.friendInfo}>
        <span className={styles.friendItemName}>{displayName}</span>
        {username && <span className={styles.friendItemUserName}>@{username}</span>}
        {previewText !== null ? (
          <span className={styles.friendItemLastMessage}>
            {isMe ? "Bạn: " : ""}
            {previewText}
          </span>
        ) : (
          <span className={styles.friendItemLastMessage}>Chưa có tin nhắn nào</span>
        )}
      </div>
      {showUnread && (
        <span className={styles.friendItemBadge} aria-label={`${unreadCount} tin nhắn chưa đọc`}>
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </div>
  );
}
