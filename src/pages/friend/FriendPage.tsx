import FriendMain from "./components/FriendMain";
import SidebarFriend from "./components/SidebarFriend";
import StatusUsers from "./components/StatusUsers";
import styles from "./Friend.module.scss";

export default function FriendPage() {
  return (
    <div className={styles.friend}>
      <div className={styles.friendSidebar}>
        <SidebarFriend />
      </div>

      <div className={styles.friendContent}>
        <FriendMain />
      </div>

      <div className={styles.friendSideBarRight}>
        <StatusUsers />
      </div>
    </div>
  );
}
