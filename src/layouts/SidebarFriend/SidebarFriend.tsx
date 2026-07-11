import styles from "./SidebarFriend.module.scss";

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
  return (
    <div className={styles.layoutInner}>
      <h1 className={styles.layoutInnerTitle}>Danh sách bạn bè</h1>
      <div className={styles.layoutList}>
        {friends.map((friend) => (
          <FriendItem key={friend.id} friend={friend} />
        ))}
      </div>
    </div>
  );
}
