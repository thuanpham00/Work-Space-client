import styles from "./Workspace.module.scss";
import SidebarFriend from "./components/SidebarFriend";

export type ModeListFriend = "list" | "chat";

export default function WorkspacePage() {
  return (
    <>
      <div className={styles.friend}>
        <div className={styles.friendSidebar}>
          <SidebarFriend />
        </div>

        <div className={styles.friendContent}>1</div>

        <div className={styles.friendSideBarRight}>2</div>
      </div>
    </>
  );
}
