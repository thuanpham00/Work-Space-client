import AvatarFallback from "../AvatarFallback/AvatarFallback";
import type { StatusUser } from "../../types/friend.type";
import styles from "./FriendCard.module.scss";

interface FriendCardProps {
  displayName: string;
  avatar: string;
  status: StatusUser;
  selectedChannel?: string;
  channelId?: string;
  showStatus: boolean;
  username?: string;
  lastMessage?: string;
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
  return (
    <div className={`${styles.friendItem} ${selectedChannel === channelId ? styles.friendItemActive : ""}`}>
      <AvatarFallback src={avatar} alt={displayName} status={status as StatusUser} showStatus={showStatus} />

      <div className={styles.friendInfo}>
        <span className={styles.friendItemName}>{displayName}</span>
        {username && <span className={styles.friendItemUserName}>@{username}</span>}
        {lastMessage && <span className={styles.friendItemLastMessage}>{lastMessage}</span>}
      </div>
    </div>
  );
}
