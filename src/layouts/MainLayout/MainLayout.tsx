/* eslint-disable react-hooks/exhaustive-deps */
import { Avatar, Layout, Menu, Tooltip } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import styles from "./MainLayout.module.scss";
import { Users } from "lucide-react";
import Header from "../../components/Header/Header";
import { useQuery } from "react-query";
import { workspaceAPI } from "../../apis/workspace.api";
import { useMemo } from "react";
import type { WorkspaceType } from "../../types/workspace.type";
import logo from "../../assets/image/chat.png";
import { useAppStore } from "../../store/store";

const { Sider, Content } = Layout;

export default function MainLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const token = useAppStore((state) => state.accessToken);

  // gọi api lấy ds workspace của user và workspace user tham gia
  const { data: dataWorkspace } = useQuery({
    queryKey: ["workspaces", token],
    queryFn: () => workspaceAPI.getWorkspaces(),
    enabled: !!token,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  const listWorkspaces = dataWorkspace?.data?.data?.workspaces || [];

  const selectedKeys = useMemo(() => {
    if (pathname === "/friends") return ["friends"];

    if (pathname.startsWith("/workspaces/")) {
      const workspaceId = pathname.split("/")[2];
      return [workspaceId];
    }

    return [];
  }, [pathname]);

  const menu = useMemo(() => {
    return [
      {
        key: "friends",
        icon: (
          <Tooltip title="Trò chuyện trực tiếp" placement="right">
            <Avatar icon={<Users />} />
          </Tooltip>
        ),
      },
      ...listWorkspaces.map((workspace: WorkspaceType) => ({
        key: workspace.id,
        icon: (
          <Tooltip title={workspace.name} placement="right">
            <Avatar src={workspace.avatar} alt={workspace.name}>
              {workspace.name[0].toUpperCase()}
            </Avatar>
          </Tooltip>
        ),
      })),
    ];
  }, [listWorkspaces, navigate]);

  return (
    <Layout className={styles.layout}>
      <Sider trigger={null} collapsible className={styles.sider} theme="dark" width={80}>
        <div className={styles.siderContent}>
          <div className={styles.logo}>
            <img src={logo} alt="logo" />
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          onClick={({ key }) => {
            if (key === "friends") {
              navigate("/friends");
            } else {
              navigate(`/workspaces/${key}`);
            }
          }}
          className={styles.menu}
          items={menu}
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
