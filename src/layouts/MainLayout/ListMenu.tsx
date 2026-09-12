import { useEffect, useMemo } from "react";
import { path } from "../../utils/path";
import { useLocation, useNavigate } from "react-router-dom";
import { getWorkspaceMenuKey, parseWorkspaceKey, parseWorkspacePath } from "../../utils/workspaceKey.util";
import type { WorkspaceType } from "../../types/workspace.type";
import { useUnreadStore } from "../../store/unreadStore";
import { Avatar, Badge, Menu, Tooltip } from "antd";
import { SearchIcon, Users } from "lucide-react";
import { workspaceAPI } from "../../apis/workspace.api";
import { useQuery } from "react-query";
import { useUserStore } from "../../store/userStore";
import styles from "./ListMenu.module.scss";
import { useUnreadCHannel } from "../../Hooks/useUnreadChannel";
import { useChannelStore } from "../../store/channelStore";
import { useBaseStore } from "../../store/baseStore";

export default function ListMenu() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const countUnreadChannelDM = useUnreadStore((state) => state.countUnreadChannelDM);
  const countUnreadWorkspace = useUnreadStore((state) => state.countUnreadWorkspace);
  const token = useUserStore((state) => state.accessToken);
  const socket = useBaseStore((state) => state.socket);
  const channelId = useChannelStore((state) => state.channelId);

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

  const selectedKeys = useMemo(() => {
    if (pathname === path.friends) return ["friends"];
    if (pathname === path.search) return ["search"];

    if (pathname.startsWith("/workspaces/")) {
      const parsed = parseWorkspacePath(pathname);
      if (parsed) {
        const ws = mappingWorkspaceUnread.find((w: WorkspaceType) => w.id === parsed.id);
        if (ws) return [getWorkspaceMenuKey(ws.name, ws.id)];
      }
      return [];
    }

    return [];
  }, [pathname, mappingWorkspaceUnread]);

  const menu = useMemo(() => {
    return [
      {
        key: "search",
        icon: (
          <Tooltip title="Tìm kiếm" placement="right">
            <Avatar
              icon={<SearchIcon size={16} />}
              className="bg-[#ef4815]!"
              onClick={() => navigate(path.search)}
            />
          </Tooltip>
        ),
      },
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
        // VD: "workspace-mac-dinh-i-2"
        key: getWorkspaceMenuKey(workspace.name, workspace.id),
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
    if (key === "friends" || key === "search") {
      navigate(key === "friends" ? path.friends : path.search);
      return;
    }

    const parsed = parseWorkspaceKey(key);
    if (parsed) {
      navigate(`/workspaces/${parsed.slug}-i-${parsed.id}`);
    }
  };

  useUnreadCHannel(token);

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
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={selectedKeys}
      onClick={({ key }) => {
        handleClickWorkspace(key);
        console.log(key);
      }}
      className={styles.menu}
      items={menu}
    />
  );
}
