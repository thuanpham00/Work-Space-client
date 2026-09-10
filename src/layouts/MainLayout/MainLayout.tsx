/* eslint-disable react-hooks/exhaustive-deps */
import { Avatar, Badge, Layout, Menu, Tooltip } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import styles from "./MainLayout.module.scss";
import { Settings, Users } from "lucide-react";
import Header from "../../components/Header/Header";
import { useQuery } from "react-query";
import { workspaceAPI } from "../../apis/workspace.api";
import { useEffect, useMemo } from "react";
import type { WorkspaceType } from "../../types/workspace.type";
import logo from "../../assets/image/chat.png";
import { path } from "../../utils/path";
import { useUserStore } from "../../store/userStore";
import { useBaseStore } from "../../store/baseStore";
import { useChannelStore } from "../../store/channelStore";
import { useUnreadStore } from "../../store/unreadStore";
import { useUnreadCHannel } from "../../Hooks/useUnreadChannel";

const { Sider, Content } = Layout;

export default function MainLayout() {
  const navigate = useNavigate();

  const { pathname } = useLocation();
  const token = useUserStore((state) => state.accessToken);
  const socket = useBaseStore((state) => state.socket);
  const channelId = useChannelStore((state) => state.channelId);
  const countUnreadChannelDM = useUnreadStore((state) => state.countUnreadChannelDM);
  const countUnreadWorkspace = useUnreadStore((state) => state.countUnreadWorkspace);

  // gọi api lấy ds workspace của user và workspace user tham gia
  const { data: dataWorkspace } = useQuery({
    queryKey: ["workspaces", token],
    queryFn: () => workspaceAPI.getWorkspaces(),
    enabled: !!token,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  const listWorkspaces = dataWorkspace?.data?.data?.workspaces || [];

  const mappingWorkspaceUnread = useMemo(() => {
    return listWorkspaces.map((workspace: WorkspaceType) => {
      const countUnread = countUnreadWorkspace.get(workspace.id) || 0;
      return {
        ...workspace,
        countUnread,
      };
    });
  }, [countUnreadWorkspace, listWorkspaces]);

  useUnreadCHannel(token);

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
            <Badge count={countUnreadChannelDM} overflowCount={99} size="small" offset={[-2, 2]}>
              <Avatar icon={<Users />} />
            </Badge>
          </Tooltip>
        ),
      },
      ...mappingWorkspaceUnread.map((workspace: WorkspaceType) => ({
        key: workspace.id,
        icon: (
          <Tooltip title={workspace.name} placement="right">
            <Badge count={workspace.countUnread ?? 0} overflowCount={99} size="small" offset={[-2, 2]}>
              <Avatar src={workspace.avatar} alt={workspace.name}>
                {workspace.name[0].toUpperCase()}
              </Avatar>
            </Badge>
          </Tooltip>
        ),
      })),
    ];
  }, [countUnreadChannelDM, countUnreadWorkspace, listWorkspaces, navigate]);

  const handleClickWorkspace = (key: string) => {
    if (key === "friends") {
      navigate("/friends");
    } else {
      navigate(`/workspaces/${key}`);
    }
  };

  useEffect(() => {
    if (!socket || !channelId) return;

    socket.on("channel_unread", (data) => {
      console.log(data);
    });

    return () => {
      socket.off("channel_unread");
    };
  }, [socket, channelId]);

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
          onClick={({ key }) => handleClickWorkspace(key)}
          className={styles.menu}
          items={menu}
        />
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
