import { useParams } from "react-router-dom";
import styles from "./Workspace.module.scss";
import { workspaceAPI } from "../../apis/workspace.api";
import { useQuery } from "react-query";
import { useEffect, useMemo } from "react";
import { useChannelStore } from "../../store/channelStore";
import SidebarWorkSpace from "./components/SidebarWorkspace/SidebarWorkSpace";
import ChannelChat from "./components/ChannelChat/ChannelChat";
import { ChannelMemberRole } from "../../types/channel.type";
import { WorkspaceMemberRole } from "../../types/workspace.type";
import Loading from "../../components/Loading/Loading";
import { AxiosError } from "axios";
import {
  WorkspaceAccessDenied,
  WorkspaceNotFound,
  WorkspaceUnknownError,
  classifyWorkspaceError,
  getErrorMessage,
} from "./components/WorkspaceAccessStates/WorkspaceAccessStates";

export type ModeListFriend = "list" | "chat";

export default function WorkspacePage() {
  // Route đăng ký: /workspaces/:id → param tên là "id"
  const { id } = useParams<{ id: string }>();
  const chooseChannelWorkspace = useChannelStore((app) => app.chooseChannelWorkspace);

  // Validate id client-side (fail fast, tránh gọi API với id rác)

  const {
    data: workSpaceDetail,
    error: workspaceError,
    isError,
    isLoading,
    isSuccess,
    refetch,
  } = useQuery({
    queryKey: ["workspace", id],
    queryFn: () => workspaceAPI.getWorkspaceById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 15, // 15 minutes
    keepPreviousData: true,
    // Không retry với lỗi 4xx vì đó là phản hồi dứt khoát từ server
    retry: (failureCount, error) => {
      if (
        error instanceof AxiosError &&
        error.response?.status &&
        error.response.status >= 400 &&
        error.response.status < 500
      ) {
        return false;
      }
      return failureCount < 1;
    },
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
  });

  const accessState = useMemo(
    () => classifyWorkspaceError(isError, isLoading, isSuccess, workspaceError),
    [isError, isLoading, isSuccess, workspaceError],
  );

  // Chỉ lấy data khi request hiện tại thành công.
  // Khi isError, workSpaceDetail là undefined theo docs của react-query,
  // kể cả khi keepPreviousData: true thì data cũ cũng không còn hợp lệ với id mới.
  const dataWorkspaceDetail = isSuccess ? workSpaceDetail?.data.data.workspace : undefined;
  const workSpaceRole = dataWorkspaceDetail?.role ?? WorkspaceMemberRole.MEMBER;

  useEffect(() => {
    // Reset channel khi không truy cập được workspace (tránh hiển thị chat cũ)
    if (accessState !== "ready" || !id) {
      chooseChannelWorkspace("", "", "", workSpaceRole, ChannelMemberRole.MEMBER);
      return;
    }
    if (dataWorkspaceDetail) {
      const categories = dataWorkspaceDetail.categories || [];
      const firstChannel = categories.flatMap((category) => category.channels)[0];

      if (firstChannel && categories) {
        chooseChannelWorkspace(id, firstChannel.id, firstChannel.name, workSpaceRole, firstChannel.role);
      }
    }
  }, [accessState, id, dataWorkspaceDetail, workSpaceRole, chooseChannelWorkspace]);

  if (accessState === "forbidden") {
    return (
      <div className={styles.workSpace}>
        <WorkspaceAccessDenied message={getErrorMessage(workspaceError)} />
      </div>
    );
  }

  if (accessState === "not_found") {
    return (
      <div className={styles.workSpace}>
        <WorkspaceNotFound message={getErrorMessage(workspaceError)} />
      </div>
    );
  }

  if (accessState === "unknown") {
    return (
      <div className={styles.workSpace}>
        <WorkspaceUnknownError message={getErrorMessage(workspaceError)} onRetry={() => refetch()} />
      </div>
    );
  }

  // accessState === "loading" | "ready"
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
