import { useParams } from "react-router-dom";
import SidebarWorkSpace from "./components/SidebarWorkSpace";
import styles from "./Workspace.module.scss";
import { workspaceAPI } from "../../apis/workspace.api";
import { useQuery } from "react-query";
import { Spin } from "antd";
import ChannelChat from "./components/ChannelChat";

export type ModeListFriend = "list" | "chat";

export default function WorkspacePage() {
  const { id } = useParams();

  const { data: workSpaceDetail } = useQuery({
    queryKey: ["workspace", id],
    queryFn: () => workspaceAPI.getWorkspaceById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 15, // 15 minutes
    keepPreviousData: true,
  });

  const dataWorkspaceDetail = workSpaceDetail?.data.data.workspace;

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
          <ChannelChat />
        </div>
      </div>
    </>
  );
}
