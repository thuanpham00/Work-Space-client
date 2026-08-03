/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import { useRef } from "react";
import MainFriend from "./components/MainFriend/MainFriend";
import SidebarFriend from "./components/SidebarFriend/SidebarFriend";
import styles from "./Friend.module.scss";
import { AddFriendModal, type AddFriendRef } from "./components/AddFriendModal/AddFriendModal";

export type ModeListFriend = "list" | "chat";

export default function FriendPage() {
  const modalAddFriendRef = useRef<AddFriendRef>(null);

  return (
    <>
      <div className={styles.friend}>
        <div className={styles.friendSidebar}>
          <SidebarFriend />
        </div>

        <div className={styles.friendContent}>
          <MainFriend openModalAddFriend={() => modalAddFriendRef.current?.handleOpen?.()} />
        </div>
      </div>

      <AddFriendModal ref={modalAddFriendRef} onClose={() => {}} onSubmitOk={() => {}} />
    </>
  );
}
