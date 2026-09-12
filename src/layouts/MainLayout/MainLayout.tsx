/* eslint-disable react-hooks/exhaustive-deps */
import { Avatar, Layout, Tooltip } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import styles from "./MainLayout.module.scss";
import { Settings } from "lucide-react";
import Header from "../../components/Header/Header";
import logo from "../../assets/image/chat.png";
import { path } from "../../utils/path";
import ListMenu from "./ListMenu";

const { Sider, Content } = Layout;

export default function MainLayout() {
  const navigate = useNavigate();

  return (
    <Layout className={styles.layout}>
      <Sider trigger={null} collapsible className={styles.sider} theme="dark" width={80}>
        <div className={styles.siderContent}>
          <div className={styles.logo}>
            <img src={logo} alt="logo" />
          </div>
        </div>
        <ListMenu />
        <div className="shrink-0 mb-2! flex justify-center">
          <Tooltip title="Cài đặt" placement="right">
            <Avatar icon={<Settings size={16} />} onClick={() => navigate(path.settingAccount)} />
          </Tooltip>
        </div>
      </Sider>
      <Layout>
        <Header />
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
