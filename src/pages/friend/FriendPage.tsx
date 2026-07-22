/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useRef, useState } from "react";
import MainFriend from "./components/MainFriend/MainFriend";
import SidebarFriend from "./components/SidebarFriend/SidebarFriend";
import styles from "./Friend.module.scss";
import { AddFriendModal, type AddFriendRef } from "./components/AddFriendModal/AddFriendModal";

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
          <SidebarFriend />
        </div>

        <div className={styles.friendContent}>
          <MainFriend openModalAddFriend={() => modalAddFriendRef.current?.handleOpen?.()} />
        </div>
      </div>

      <AddFriendModal ref={modalAddFriendRef} onClose={() => {}} onSubmitOk={() => {}} />
    </FriendContext.Provider>
  );
}
