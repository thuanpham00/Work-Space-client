import { Button, Tabs, type TabsProps } from "antd";
import styles from "./StatusUsers.module.scss";
import { Loader, Plus, Send, UsersRound } from "lucide-react";

export default function StatusUsers({ openModalAddFriend }: { openModalAddFriend: () => void }) {
  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Online</span>
        </div>
      ),
      children: "Content of Tab Pane 1",
    },
    {
      key: "2",
      label: (
        <div className="flex items-center gap-2">
          <UsersRound size={16} />
          <span>Tất cả</span>
        </div>
      ),
      children: "Content of Tab Pane 2",
    },
    {
      key: "3",
      label: (
        <div className="flex items-center gap-2">
          <Send size={16} /> <span>Đã gửi yêu cầu</span>
        </div>
      ),
      children: "Content of Tab Pane 3",
    },
    {
      key: "4",
      label: (
        <div className="flex items-center gap-2">
          <Loader size={16} />
          <span>Chờ xác nhận</span>
        </div>
      ),
      children: "Content of Tab Pane 3",
    },
  ];

  return (
    <div className={styles.statusUsersInner}>
      <Tabs
        defaultActiveKey="1"
        items={items}
        onChange={onChange}
        tabBarExtraContent={{
          right: (
            <Button type="primary" onClick={openModalAddFriend}>
              <Plus size={16} />
              Thêm bạn
            </Button>
          ),
        }}
      />
    </div>
  );
}
