import { useParams } from "react-router-dom";
import styles from "./Workspace.module.scss";
import { workspaceAPI } from "../../apis/workspace.api";
import { useQuery } from "react-query";
import { useEffect, useMemo } from "react";
import { useChannelStore } from "../../store/channelStore";
import { parseWorkspacePath } from "../../utils/workspaceKey.util";
import SidebarWorkSpace from "./components/SidebarWorkspace/SidebarWorkSpace";
import ChannelChat from "./components/ChannelChat/ChannelChat";
import { WorkspaceMemberRole } from "../../types/workspace.type";
import Loading from "../../components/Loading/Loading";

export type ModeListFriend = "list" | "chat";

export default function WorkspacePage() {
  const { slug } = useParams();
  const chooseChannelWorkspace = useChannelStore((app) => app.chooseChannelWorkspace);

  const id = useMemo(() => {
    if (!slug) return undefined;
    const fullPath = `/workspaces/${slug}`;
    const parsed = parseWorkspacePath(fullPath);
    return parsed?.id;
  }, [slug]);

  const { data: workSpaceDetail } = useQuery({
    queryKey: ["workspace", id],
    queryFn: () => workspaceAPI.getWorkspaceById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 15, // 15 minutes
    keepPreviousData: true,
  });

  const dataWorkspaceDetail = workSpaceDetail?.data.data.workspace;
  const workSpaceRole = dataWorkspaceDetail?.role ?? WorkspaceMemberRole.MEMBER;

  useEffect(() => {
    if (id && dataWorkspaceDetail) {
      const categories = dataWorkspaceDetail.categories || [];
      const firstChannel = categories.flatMap((category) => category.channels)[0];

      if (firstChannel && categories) {
        chooseChannelWorkspace(id, firstChannel.id, firstChannel.name, workSpaceRole, firstChannel.role);
      }
    }
  }, [id, workSpaceDetail, dataWorkspaceDetail, workSpaceRole, chooseChannelWorkspace]);

  return (
    <>
      <div className={styles.workSpace}>
        <div className={styles.workSpaceSidebar}>
          {dataWorkspaceDetail && id ? (
            <SidebarWorkSpace data={dataWorkspaceDetail} workspaceId={id} />
          ) : (
            <Loading tip="Đang tải..." size="default" />
          )}
        </div>

        <div className={styles.workSpaceContent}>
          {dataWorkspaceDetail && id ? <ChannelChat /> : <Loading tip="Đang tải..." size="default" />}
        </div>
      </div>
    </>
  );
}
