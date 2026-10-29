/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo } from "react";
import { path } from "../../utils/path";
import { useLocation, useNavigate } from "react-router-dom";
import { parseWorkspaceIdFromPath } from "../../utils/workspaceKey.util";
import type { WorkspaceType } from "../../types/workspace.type";
import { useUnreadStore } from "../../store/unreadStore";
import { Avatar, Badge, Menu, Tooltip } from "antd";
import { SearchIcon, Users } from "lucide-react";
import { workspaceAPI } from "../../apis/workspace.api";
import { useQuery, useQueryClient } from "react-query";
import { useUserStore } from "../../store/userStore";
import styles from "./ListMenu.module.scss";
import { useUnreadChannels } from "../../Hooks/useUnreadChannel";
import { useChannelStore } from "../../store/channelStore";
import { useBaseStore } from "../../store/baseStore";
import type { ChannelUnreadPayload } from "../../types/channel.type";

export default function ListMenu() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const markReadChannel = useUnreadStore((state) => state.markReadOptimistic);
  const markUnreadChannel = useUnreadStore((state) => state.markUnread);
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
      const idFromPath = parseWorkspaceIdFromPath(pathname);
      if (idFromPath) {
        const ws = mappingWorkspaceUnread.find((w: WorkspaceType) => String(w.id) === idFromPath);
        if (ws) return [String(ws.id)];
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
        // Dùng id thuần làm key menu, không kèm slug
        key: String(workspace.id),
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

    // key chính là String(workspace.id) — navigate thẳng không cần slug
    navigate(`/workspaces/${key}`);
  };

  useUnreadChannels(token);

  useEffect(() => {
    if (!socket || !token) return;

    socket.on("channel_unread", (data: ChannelUnreadPayload) => {
      markUnreadChannel(data);
    });

    return () => {
      socket.off("channel_unread");
    };
  }, [socket, token]);

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
