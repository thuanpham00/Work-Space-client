import { Button } from "antd";
import styles from "./SidebarFriend.module.scss";
import { useContext } from "react";
import { List } from "lucide-react";
import { FriendContext, type ModeListFriend } from "../FriendPage";
import { useQuery } from "react-query";
import { useAppStore } from "../../../store/store";
import { channelApi } from "../../../apis/channel.api";

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

const FriendItem = ({
  friend,
  setModeListFriend,
}: {
  friend: (typeof friends)[0];
  setModeListFriend: (value: ModeListFriend) => void;
}) => {
  return (
    <button className={styles.friendItem} onClick={() => setModeListFriend("chat")}>
      <img src={friend.avatar} alt={friend.name} className={styles.friendAvatar} />
      <span className={styles.friendItemName}>{friend.name}</span>
    </button>
  );
};

export default function SidebarFriend() {
  const { setModeListFriend } = useContext(FriendContext);
  const accessToken = useAppStore((app) => app.accessToken);

  const { data: dataChannelDM, isLoading } = useQuery({
    queryKey: ["channel-DM", accessToken],
    queryFn: () => channelApi.getDirectMessageChannels({ search: "" }),
    staleTime: 1000 * 60 * 15, // 15 minutes
    keepPreviousData: true,
    enabled: Boolean(accessToken),
  });

  console.log(dataChannelDM);

  return (
    <div className={styles.layoutInner}>
      <Button
        type="primary"
        onClick={() => setModeListFriend("list")}
        className={styles.buttonListFriend}
        icon={<List size={16} />}
      >
        Danh sách bạn bè
      </Button>
      <div className="border-t-2! border-gray-300 my-2!"></div>
      <div className="flex items-center justify-between mb-3!">
        <h2 className={styles.layoutInnerTitleChat}>Tin nhắn trực tiếp</h2>
      </div>
      <div className={styles.layoutList}>
        {friends.map((friend) => (
          <FriendItem key={friend.id} friend={friend} setModeListFriend={setModeListFriend} />
        ))}
      </div>
    </div>
  );
}
