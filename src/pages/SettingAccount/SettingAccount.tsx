import { Menu, type MenuProps } from "antd";
import { UserOutlined } from "@ant-design/icons";
import styles from "./SettingAccount.module.scss";
import { useState } from "react";
import ChangePasswordPage from "./Components/ChangePasswordPage";
import SettingDisplayPage from "./Components/SettingDisplayPage";
import InfoUserPage from "./Components/InfoUserPage";
import { useQuery } from "react-query";
import { userAPI } from "../../apis/user.api";
import { useUserStore } from "../../store/userStore";

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  {
    key: "account",
    label: "Tài khoản",
    icon: <UserOutlined />,
    children: [
      {
        key: "info",
        label: "Thông tin tài khoản",
      },
      {
        key: "password",
        label: "Mật khẩu",
      },
      {
        key: "setting",
        label: "Quyền riêng tư & hiển thị",
      },
    ],
  },
];

export default function SettingAccount() {
  const [activeKey, setActiveKey] = useState<string>("info");
  const token = useUserStore((state) => state.accessToken);

  // nếu token thay đổi thì gọi lại api để lấy thông tin user
  const { data } = useQuery({
    queryKey: ["me", token],
    queryFn: () => userAPI.getProfile(),
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const infoUser = data?.data?.data?.user;

  const handleClick: MenuProps["onClick"] = ({ key }) => {
    switch (key) {
      case "password":
        setActiveKey("password");
        break;

      case "setting":
        setActiveKey("setting");
        break;

      case "info":
        setActiveKey("info");
        break;
    }
  };

  const content = () => {
    switch (activeKey) {
      case "password":
        return <ChangePasswordPage />;
      case "setting":
        return <SettingDisplayPage infoUser={infoUser} />;
      case "info":
        return <InfoUserPage infoUser={infoUser} />;
    }
  };

  return (
    <div className={styles.wrapper}>
      <Menu
        mode="inline"
        items={items}
        selectedKeys={[activeKey]}
        defaultOpenKeys={["account"]}
        onClick={handleClick}
        className={styles.menu}
        expandIcon={() => null}
      />

      <div className={styles.content}>{content()}</div>
    </div>
  );
}
