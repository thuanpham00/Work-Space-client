import { useParams } from "react-router-dom";
import SidebarWorkSpace from "./components/SidebarWorkSpace";
import styles from "./Workspace.module.scss";
import { workspaceAPI } from "../../apis/workspace.api";
import { useQuery } from "react-query";
import type { WorkspaceType } from "../../types/workspace.type";

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
          <SidebarWorkSpace data={dataWorkspaceDetail as WorkspaceType} />
        </div>

        <div className={styles.workSpaceContent}>122</div>
      </div>
    </>
  );
}
