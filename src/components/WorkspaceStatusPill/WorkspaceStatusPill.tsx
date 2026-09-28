import { WorkspaceMemberStatus } from "../../types/workspace.type";
import styles from "./WorkspaceStatusPill.module.scss";

export type WorkspaceStatusTone = "active" | "pending" | "rejected" | "offline";

const WORKSPACE_STATUS_LABEL: Partial<Record<WorkspaceMemberStatus, string>> = {
  [WorkspaceMemberStatus.ACTIVE]: "Đã tham gia",
  [WorkspaceMemberStatus.PENDING_INVITE]: "Lời mời đang chờ",
  [WorkspaceMemberStatus.PENDING_REQUEST]: "Yêu cầu đang chờ",
  [WorkspaceMemberStatus.REJECTED]: "Đã bị từ chối",
  [WorkspaceMemberStatus.LEFT]: "Đã rời khỏi",
  [WorkspaceMemberStatus.CANCELLED]: "Đã hủy tham gia",
};

const WORKSPACE_STATUS_TONE: Partial<Record<WorkspaceMemberStatus, WorkspaceStatusTone>> = {
  [WorkspaceMemberStatus.ACTIVE]: "active",
  [WorkspaceMemberStatus.PENDING_INVITE]: "pending",
  [WorkspaceMemberStatus.PENDING_REQUEST]: "pending",
  [WorkspaceMemberStatus.REJECTED]: "rejected",
  [WorkspaceMemberStatus.LEFT]: "offline",
  [WorkspaceMemberStatus.CANCELLED]: "offline",
};

type WorkspaceStatusPillProps = {
  workspaceStatus?: WorkspaceMemberStatus | string | null;
  labelOverride?: Partial<Record<WorkspaceMemberStatus, string>>;
  toneOverride?: Partial<Record<WorkspaceMemberStatus, WorkspaceStatusTone>>;
  fallback?: React.ReactNode;
};

export const WorkspaceStatusPill = ({
  workspaceStatus,
  labelOverride,
  toneOverride,
  fallback = null,
}: WorkspaceStatusPillProps) => {
  if (!workspaceStatus) return fallback;

  const key = workspaceStatus as WorkspaceMemberStatus;
  const tone = toneOverride?.[key] ?? WORKSPACE_STATUS_TONE[key] ?? "offline";
  const label = labelOverride?.[key] ?? WORKSPACE_STATUS_LABEL[key];
  if (!label) return fallback;

  return (
    <span className={`${styles.workspaceStatusPill} ${styles[`workspaceStatusTone_${tone}`]}`}>{label}</span>
  );
};
