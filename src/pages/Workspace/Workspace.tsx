/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";
import styles from "./Workspace.module.scss";
import SidebarFriend from "./components/SidebarFriend";

export type ModeListFriend = "list" | "chat";

export const FriendContext = createContext<{
  modeListFriend: ModeListFriend;
  setModeListFriend: (value: ModeListFriend) => void;
}>({
  modeListFriend: "list",
  setModeListFriend: (_value: ModeListFriend) => {},
});

export default function WorkspacePage() {
  const [modeListFriend, setModeListFriend] = useState<ModeListFriend>("list");

  return (
    <FriendContext.Provider value={{ modeListFriend, setModeListFriend }}>
      <div className={styles.friend}>
        <div className={styles.friendSidebar}>
          <SidebarFriend />
        </div>

        <div className={styles.friendContent}>1</div>

        <div className={styles.friendSideBarRight}>2</div>
      </div>
    </FriendContext.Provider>
  );
}
