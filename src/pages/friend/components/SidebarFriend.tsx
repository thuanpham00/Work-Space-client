import { Button } from "antd";
import styles from "./SidebarFriend.module.scss";
import { PlusOutlined } from "@ant-design/icons";
import { useRef } from "react";
import { AddFriendModal, type AddFriendRef } from "./AddFriendModal";

const friends = [
  {
    id: 1,
    name: "John Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 2,
    name: "Jane Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 3,
    name: "Jim Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 4,
    name: "Jill Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 5,
    name: "Jack Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 6,
    name: "Jill Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
  },

  {
    id: 4,
    name: "Jill Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 5,
    name: "Jack Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 6,
    name: "Jill Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
  },

  {
    id: 4,
    name: "Jill Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 5,
    name: "Jack Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 6,
    name: "Jill Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
  },

  {
    id: 4,
    name: "Jill Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 5,
    name: "Jack Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 6,
    name: "Jill Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
];

const FriendItem = ({ friend }: { friend: (typeof friends)[0] }) => {
  return (
    <div className={styles.friendItem}>
      <img src={friend.avatar} alt={friend.name} className={styles.friendAvatar} />
      <span className={styles.friendItemName}>{friend.name}</span>
    </div>
  );
};

export default function SidebarFriend() {
  const modalAddFriendRef = useRef<AddFriendRef>(null);

  return (
    <div className={styles.layoutInner}>
      <div className="flex items-center justify-between mb-3!">
        <h1 className={styles.layoutInnerTitle}>Danh sách bạn bè</h1>
        <Button
          type="link"
          icon={<PlusOutlined className="text-xl!" />}
          className={styles.addFriendButton}
          onClick={() => {
            console.log("click");
            modalAddFriendRef.current?.handleOpen?.();
          }}
        ></Button>
      </div>
      <div className={styles.layoutList}>
        {friends.map((friend) => (
          <FriendItem key={friend.id} friend={friend} />
        ))}
      </div>

      <AddFriendModal ref={modalAddFriendRef} onClose={() => {}} onSubmitOk={() => {}} />
    </div>
  );
}
