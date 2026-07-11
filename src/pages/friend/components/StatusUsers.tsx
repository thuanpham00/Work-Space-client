import { Tabs, type TabsProps } from "antd";
import styles from "./StatusUsers.module.scss";

export default function StatusUsers() {
  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Online",
      children: "Content of Tab Pane 1",
    },
    {
      key: "2",
      label: "Tất cả",
      children: "Content of Tab Pane 2",
    },
    {
      key: "3",
      label: "Đã gửi yêu cầu",
      children: "Content of Tab Pane 3",
    },
  ];

  return (
    <div className={styles.statusUsersInner}>
      <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
    </div>
  );
}
