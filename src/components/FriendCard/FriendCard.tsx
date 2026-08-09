import AvatarFallback from "../AvatarFallback/AvatarFallback";
import type { StatusUser } from "../../types/friend.type";
import styles from "./FriendCard.module.scss";

interface FriendCardProps {
  displayName: string;
  avatar: string;
  status: StatusUser;
  selectedFriend: string;
  friendId: string;
  showStatus: boolean;
  username?: string;
}

export default function FriendCard({
  displayName,
  avatar,
  status,
  selectedFriend,
  friendId,
  username,
  showStatus = false,
}: FriendCardProps) {
  return (
    <div className={`${styles.friendItem} ${selectedFriend === friendId ? styles.friendItemActive : ""}`}>
      <AvatarFallback src={avatar} alt={displayName} status={status as StatusUser} showStatus={showStatus} />

      <div className={styles.friendInfo}>
        <span className={styles.friendItemName}>{displayName}</span>
        {username && <span className={styles.friendItemUserName}>@{username}</span>}
      </div>
    </div>
  );
}
