import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Tabs } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { path } from "../../../utils/path";
import styles from "./UserSideNav.module.scss";

export default function UserSideNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const activeKey = pathname.endsWith(path.changePassword) ? "password" : "info";

  const items = [
    {
      key: "info",
      label: "Thông tin tài khoản",
      icon: <UserOutlined />,
    },
    {
      key: "password",
      label: "Thay đổi mật khẩu",
      icon: <LockOutlined />,
    },
  ];

  const handleChange = (key: string) => {
    if (key === "password") navigate(path.changePassword);
    else navigate(path.infoUser);
  };

  return (
    <div className={styles.wrapper}>
      <Tabs
        activeKey={activeKey}
        onChange={handleChange}
        items={items}
        className={styles.tabs}
      />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}
