import MainFriend from "./components/MainFriend/MainFriend";
import SidebarFriend from "./components/SidebarFriend/SidebarFriend";
import styles from "./Friend.module.scss";

export default function FriendPage() {
  return (
    <>
      <div className={styles.friend}>
        <div className={styles.friendSidebar}>
          <SidebarFriend />
        </div>

        <div className={styles.friendContent}>
          <MainFriend />
        </div>
      </div>
    </>
  );
}
