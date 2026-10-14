/* eslint-disable react-refresh/only-export-components */
import { AxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "antd";
import { Home, RefreshCw, ShieldAlert } from "lucide-react";
import styles from "./WorkspaceAccessStates.module.scss";
import { path } from "../../../../utils/path";

interface AccessProps {
  title: string;
  description: string;
  primaryLabel: string;
  primaryIcon: React.ReactNode;
  onPrimary?: () => void;
  primaryTo?: string;
}

const AccessLayout = ({
  title,
  description,
  primaryLabel,
  primaryIcon,
  onPrimary,
  primaryTo,
}: AccessProps) => {
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.illustration}>
          <ShieldAlert size={56} className={styles.icon} />
          <div className={styles.glow} />
        </div>

        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>

        <div className={styles.actions}>
          {primaryTo ? (
            <Link to={primaryTo} className={styles.link}>
              <Button type="primary" icon={primaryIcon} className={styles.primaryBtn}>
                {primaryLabel}
              </Button>
            </Link>
          ) : (
            <Button type="primary" icon={primaryIcon} className={styles.primaryBtn} onClick={onPrimary}>
              {primaryLabel}
            </Button>
          )}
        </div>

        <button type="button" className={styles.backText} onClick={() => navigate(-1)}>
          ← Quay lại trang trước
        </button>
      </div>
    </div>
  );
};

interface WorkspaceAccessDeniedProps {
  message?: string;
}

export const WorkspaceAccessDenied = ({ message }: WorkspaceAccessDeniedProps) => {
  return (
    <AccessLayout
      title="Bạn không có quyền truy cập"
      description={
        message
          ? `${message}. Workspace này là riêng tư. Hãy nhờ quản trị viên mời bạn hoặc quay về trang bạn bè.`
          : "Workspace này là riêng tư. Hãy nhờ quản trị viên mời bạn hoặc quay về trang bạn bè."
      }
      primaryLabel="Về trang chủ"
      primaryIcon={<Home size={16} />}
      primaryTo={path.search}
    />
  );
};

interface WorkspaceNotFoundProps {
  message?: string;
}

export const WorkspaceNotFound = ({ message }: WorkspaceNotFoundProps) => {
  return (
    <AccessLayout
      title="Không tìm thấy workspace"
      description={
        message
          ? `${message}. Workspace bạn đang tìm có thể đã bị xoá hoặc đường dẫn không đúng.`
          : "Workspace bạn đang tìm có thể đã bị xoá hoặc đường dẫn không đúng."
      }
      primaryLabel="Về trang chủ"
      primaryIcon={<Home size={16} />}
      primaryTo={path.search}
    />
  );
};

interface WorkspaceUnknownErrorProps {
  message?: string;
  onRetry?: () => void;
}

export const WorkspaceUnknownError = ({ message, onRetry }: WorkspaceUnknownErrorProps) => {
  return (
    <AccessLayout
      title="Đã xảy ra lỗi"
      description={
        message
          ? `${message}. Vui lòng thử lại sau ít phút.`
          : "Không thể tải workspace. Vui lòng thử lại sau ít phút."
      }
      primaryLabel="Thử lại"
      primaryIcon={<RefreshCw size={16} />}
      onPrimary={onRetry}
    />
  );
};

/**
 * Helper phân loại lỗi trả về từ useQuery cho workspaceAPI.getWorkspaceById.
 * Trả về 1 trong các state: "loading" | "ready" | "forbidden" | "not_found" | "unknown"
 */
export type WorkspaceAccessState = "loading" | "ready" | "forbidden" | "not_found" | "unknown";

export function classifyWorkspaceError(
  isError: boolean,
  isLoading: boolean,
  isSuccess: boolean,
  error: unknown,
): WorkspaceAccessState {
  if (isLoading) return "loading";
  if (isSuccess) return "ready";
  if (!isError || !error) return "loading";

  if (error instanceof AxiosError) {
    const status = error.response?.status;
    if (status === 403) return "forbidden";
    if (status === 404) return "not_found";
    if (status === 401) return "forbidden";
  }
  return "unknown";
}

export function getErrorMessage(error: unknown): string | undefined {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message;
  }
  if (error instanceof Error) return error.message;
  return undefined;
}
