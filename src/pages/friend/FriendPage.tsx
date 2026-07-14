/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useRef, useState } from "react";
import MainFriend from "./components/MainFriend";
import SidebarFriend from "./components/SidebarFriend";
import styles from "./Friend.module.scss";
import InfoUser from "./components/InfoUser";
import { AddFriendModal, type AddFriendRef } from "./components/AddFriendModal";

export type ModeListFriend = "list" | "chat";

export const FriendContext = createContext<{
  modeListFriend: ModeListFriend;
  setModeListFriend: (value: ModeListFriend) => void;
}>({
  modeListFriend: "list",
  setModeListFriend: (_value: ModeListFriend) => {},
});

export default function FriendPage() {
  const [modeListFriend, setModeListFriend] = useState<ModeListFriend>("list");
  const modalAddFriendRef = useRef<AddFriendRef>(null);

  return (
    <FriendContext.Provider value={{ modeListFriend, setModeListFriend }}>
      <div className={styles.friend}>
        <div className={styles.friendSidebar}>
          <SidebarFriend openModalAddFriend={() => modalAddFriendRef.current?.handleOpen?.()} />
        </div>

        <div className={styles.friendContent}>
          <MainFriend openModalAddFriend={() => modalAddFriendRef.current?.handleOpen?.()} />
        </div>

        <div className={styles.friendSideBarRight}>
          <InfoUser />
        </div>
      </div>

      <AddFriendModal ref={modalAddFriendRef} onClose={() => {}} onSubmitOk={() => {}} />
    </FriendContext.Provider>
  );
}
