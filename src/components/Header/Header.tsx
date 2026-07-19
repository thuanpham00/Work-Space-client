import { Button, Layout, Popover, Avatar, Divider } from "antd";
import { UserOutlined, SettingOutlined, LogoutOutlined, SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.scss";
import { useAppStore } from "../../store/store";
import { getAccessTokenFromLS, setIsDarkModeToLS } from "../../utils/auth";
import { userAPI } from "../../apis/user.api";
import { path } from "../../utils/path";

const { Header: HeaderAntd } = Layout;

export default function Header() {
  const navigate = useNavigate();
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const reset = useAppStore((state) => state.reset);
  const setIsDarkMode = useAppStore((state) => state.setIsDarkMode);

  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: () => userAPI.getProfile(),
    enabled: getAccessTokenFromLS() !== null,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const infoUser = data?.data?.data?.user;

  const logoutMutation = useMutation({
    mutationFn: () => {
      return userAPI.logout();
    },
    onSuccess: () => {
      reset();
      navigate("/auth/login");
    },
  });

  const toggleDarkMode = () => {
    setIsDarkModeToLS(!isDarkMode);
    setIsDarkMode(!isDarkMode);
  };

  const userMenuContent = (
    <div className={styles.userMenu}>
      <div className={styles.userInfo}>
        <p className={styles.userNameLabel}>{infoUser?.username || "User"}</p>
        <p className={styles.userEmail}>{infoUser?.email || "email@example.com"}</p>
      </div>
      <Divider />
      <button className={styles.menuItem} onClick={() => navigate(path.infoUser)}>
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
