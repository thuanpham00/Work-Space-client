import { Button, Layout, Popover, Avatar, Divider } from "antd";
import { UserOutlined, SettingOutlined, LogoutOutlined, SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.scss";
import { userAPI } from "../../apis/user.api";
import { path } from "../../utils/path";
import { useBaseStore } from "../../store/baseStore";
import { useUserStore } from "../../store/userStore";
import { useChannelStore } from "../../store/channelStore";

const { Header: HeaderAntd } = Layout;

export default function Header() {
  const navigate = useNavigate();
  const isDarkMode = useBaseStore((state) => state.isDarkMode);
  const setIsDarkMode = useBaseStore((state) => state.setIsDarkMode);
  const resetBaseStore = useBaseStore((state) => state.reset);
  const resetUserStore = useUserStore((state) => state.reset);
  const resetChannelStore = useChannelStore((state) => state.reset);
  const token = useUserStore((state) => state.accessToken);

  const { data } = useQuery({
    queryKey: ["me", token],
    queryFn: () => userAPI.getProfile(),
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const infoUser = data?.data?.data?.user;

  const logoutMutation = useMutation({
    mutationFn: () => {
      return userAPI.logout();
    },
    onSuccess: () => {
      resetBaseStore();
      resetUserStore();
      resetChannelStore();
      navigate("/auth/login");
    },
  });

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const userMenuContent = (
    <div className={styles.userMenu}>
      <div className={styles.userInfo}>
        <p className={styles.userNameLabel}>{infoUser?.username || "User"}</p>
        <p className={styles.userEmail}>{infoUser?.email || "email@example.com"}</p>
      </div>
      <Divider className="my-2! mx-2!" />
      <button className={styles.menuItem} onClick={() => navigate(path.settingAccount)}>
        <SettingOutlined />
        <span>Cài đặt tài khoản</span>
      </button>
      <button
        className={`${styles.menuItem} ${styles.menuItemDanger}`}
        onClick={() => logoutMutation.mutate()}
      >
        <LogoutOutlined />
        <span>Đăng xuất</span>
      </button>
    </div>
  );

  return (
    <HeaderAntd className={styles.header}>
      <div className={styles.logoSection}>
        <h1 className={styles.logoText}>WorkSpace</h1>
      </div>

      <div className={styles.actions}>
        <Button
          type="text"
          icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleDarkMode}
          className={styles.themeToggle}
        />

        <Popover content={userMenuContent} trigger="click" placement="bottomRight" arrow={false}>
          <button className={styles.userButton}>
            <Avatar
              size={36}
              src={infoUser?.avatar}
              icon={<UserOutlined />}
              style={{ borderRadius: "100%", objectFit: "cover", width: "36px", height: "36px" }}
            />
            <div className={styles.userName}>
              <p className={styles.userNameText}>{infoUser?.username || "User"}</p>
            </div>
          </button>
        </Popover>
      </div>
    </HeaderAntd>
  );
}
