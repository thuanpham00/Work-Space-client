import { UploadOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { Layout, Menu, Tooltip } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import styles from "./MainLayout.module.scss";
import Header from "../../components/Header";
import { Users } from "lucide-react";

const { Sider, Content } = Layout;

export default function MainLayout() {
  const navigate = useNavigate();

  return (
    <Layout className={styles.layout}>
      <Sider trigger={null} collapsible className={styles.sider} theme="dark" width={64}>
        <div className={styles.siderContent}>
          <div className={styles.logo}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          className={styles.menu}
          items={[
            {
              key: "1",
              icon: (
                <Tooltip title="Bạn bè">
                  <Users onClick={() => navigate("/friends")} />
                </Tooltip>
              ),
            },
            { key: "2", icon: <VideoCameraOutlined /> },
            { key: "3", icon: <UploadOutlined /> },
          ]}
        />
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
