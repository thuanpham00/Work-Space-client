import SidebarFriend from "../../layouts/SidebarFriend/SidebarFriend";
import styles from "./friend.module.scss";

export default function FriendPage() {
  return (
    <div className={styles.friend}>
      <div className={styles.friendSidebar}>
        <SidebarFriend />
      </div>

      <div className={styles.friendContent}>
        <div>Nội dung</div>
      </div>
    </div>
  );
}
