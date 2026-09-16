import type { ReactNode } from "react";
import AvatarFallback from "../../../components/AvatarFallback/AvatarFallback";
import type { SearchItem } from "../../../types/search.type";
import { StatusRequest } from "../../../types/user.type";
import type { StatusUser } from "../../../types/friend.type";
import styles from "./SearchResultItem.module.scss";
import { WorkspaceMemberStatus } from "../../../types/workspace.type";

type Props = {
  item: SearchItem;
  keyword: string;
  onUserClick?: (userId: string, type: "user" | "workspace") => void;
};

const friendStatusLabel: Record<string, string> = {
  [StatusRequest.ONLINE]: "Trực tuyến",
  [StatusRequest.ACCEPTED]: "Bạn bè",
  [StatusRequest.REQUESTED]: "Đã gửi lời mời",
  [StatusRequest.RECEIVED]: "Có lời mời kết bạn",
};

const friendStatusTone: Record<string, "success" | "warning" | "info" | "default"> = {
  [StatusRequest.ONLINE]: "success",
  [StatusRequest.ACCEPTED]: "success",
  [StatusRequest.REQUESTED]: "warning",
  [StatusRequest.RECEIVED]: "info",
};

type WorkspaceTone = "active" | "pending" | "rejected" | "offline";

const workspaceStatusLabel: Record<string, string> = {
  [WorkspaceMemberStatus.ACTIVE]: "Đã tham gia",
  [WorkspaceMemberStatus.PENDING_INVITE]: "Lời mời đang chờ",
  [WorkspaceMemberStatus.PENDING_REQUEST]: "Yêu cầu đang chờ",
  [WorkspaceMemberStatus.REJECTED]: "Đã bị từ chối",
  [WorkspaceMemberStatus.LEFT]: "Đã rời khỏi",
  [WorkspaceMemberStatus.CANCELLED]: "Đã hủy tham gia",
};

const workspaceStatusTone: Record<string, WorkspaceTone> = {
  [WorkspaceMemberStatus.ACTIVE]: "active",
  [WorkspaceMemberStatus.PENDING_INVITE]: "pending",
  [WorkspaceMemberStatus.PENDING_REQUEST]: "pending",
  [WorkspaceMemberStatus.REJECTED]: "rejected",
  [WorkspaceMemberStatus.LEFT]: "offline",
  [WorkspaceMemberStatus.CANCELLED]: "offline",
};

const userStatusPill = (friendStatus?: string) => {
  if (!friendStatus) return null;
  const tone = friendStatusTone[friendStatus] ?? "default";
  const label = friendStatusLabel[friendStatus] || friendStatus;
  return (
    <span className={`${styles.statusPill} ${styles[`tone_${tone}`]}`}>
      <span className={styles.statusDot} />
      {label}
    </span>
  );
};

const workspaceStatusPill = (workspaceStatus?: string) => {
  if (!workspaceStatus) return null;
  const tone = workspaceStatusTone[workspaceStatus] ?? "offline";
  const label = workspaceStatusLabel[workspaceStatus] || workspaceStatus;
  return (
    <span className={`${styles.statusPill} ${styles[`wsTone_${tone}`]}`}>
      <span className={styles.statusDot} />
      {label}
    </span>
  );
};

export default function SearchResultItem({ item, keyword, onUserClick }: Props) {
  if (item.type === "user") {
    return <UserResultCard item={item} keyword={keyword} onUserClick={onUserClick} />;
  }
  return <WorkspaceResultCard item={item} keyword={keyword} onUserClick={onUserClick} />;
}

function UserResultCard({
  item,
  keyword,
  onUserClick,
}: {
  item: Extract<SearchItem, { type: "user" }>;
  keyword: string;
  onUserClick?: (userId: string, type: "user" | "workspace") => void;
}) {
  const displayName = item.fullName || item.displayName || item.username;

  const handleClick = () => {
    onUserClick?.(item.id, "user");
  };

  return (
    <div className={styles.item} onClick={handleClick}>
      <div className={styles.avatarWrap}>
        <AvatarFallback
          src={item.avatar || null}
          alt={displayName}
          showStatus
          status={item.status as StatusUser}
          size={44}
        />
      </div>
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <div className={styles.name}>
            <span className={styles.nameText}>{highlight(displayName, keyword)}</span>
            {userStatusPill(item.friendStatus)}
          </div>
        </div>
        <div className={styles.meta}>
          {item.username && <span className={styles.username}>@{highlight(item.username, keyword)}</span>}
        </div>
      </div>
    </div>
  );
}

function WorkspaceResultCard({
  item,
  keyword,
  onUserClick,
}: {
  item: Extract<SearchItem, { type: "workspace" }>;
  keyword: string;
  onUserClick?: (userId: string, type: "user" | "workspace") => void;
}) {
  const handleClick = () => {
    onUserClick?.(item.id, "workspace");
  };

  return (
    <div className={styles.item} onClick={handleClick}>
      <div className={styles.avatarWrap}>
        <AvatarFallback src={item.avatar || null} alt={item.name} showStatus={false} size={44} />
      </div>
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <div className={styles.name}>
            <span className={styles.nameText}>{highlight(item.name, keyword)}</span>
            {workspaceStatusPill(item.workspaceStatus)}
          </div>
        </div>
        <div className={styles.meta}>
          {item.owner && (
            <div className={styles.description}>
              Chủ workspace: {item.owner.fullName || item.owner.username}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function highlight(text: string, keyword: string): ReactNode {
  if (!keyword || !text) return text;
  const lowerText = text.toLowerCase();
  const lowerKey = keyword.toLowerCase();
  const idx = lowerText.indexOf(lowerKey);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className={styles.mark}>{text.slice(idx, idx + keyword.length)}</mark>
      {text.slice(idx + keyword.length)}
    </>
  );
}
