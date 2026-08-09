import { useParams } from "react-router-dom";
import SidebarWorkSpace from "./components/SidebarWorkSpace";
import styles from "./Workspace.module.scss";
import { workspaceAPI } from "../../apis/workspace.api";
import { useQuery } from "react-query";
import { Spin } from "antd";
import ChannelChat from "./components/ChannelChat";
import { useEffect } from "react";
import { useChannelStore } from "../../store/channelStore";

export type ModeListFriend = "list" | "chat";

export default function WorkspacePage() {
  const { id } = useParams();
  const chooseChannelWorkspace = useChannelStore((app) => app.chooseChannelWorkspace);

  const { data: workSpaceDetail } = useQuery({
    queryKey: ["workspace", id],
    queryFn: () => workspaceAPI.getWorkspaceById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 15, // 15 minutes
    keepPreviousData: true,
  });

  const dataWorkspaceDetail = workSpaceDetail?.data.data.workspace;

  useEffect(() => {
    if (id && dataWorkspaceDetail) {
      const categories = dataWorkspaceDetail.categories || [];
      const firstChannel = categories.flatMap((category) => category.channels)[0];

      if (firstChannel && categories) {
        chooseChannelWorkspace(id, firstChannel.id);
      }
    }
  }, [id, workSpaceDetail]);

  return (
    <>
      <div className={styles.workSpace}>
        <div className={styles.workSpaceSidebar}>
          {dataWorkspaceDetail && id ? (
            <SidebarWorkSpace data={dataWorkspaceDetail} workspaceId={id} />
          ) : (
            <div className={styles.loading}>
              <Spin size="large" tip="Loading..." />
            </div>
          )}
        </div>

        <div className={styles.workSpaceContent}>
          {dataWorkspaceDetail && id ? (
            <ChannelChat />
          ) : (
            <div className={styles.loading}>
              <Spin size="large" tip="Loading..." />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
