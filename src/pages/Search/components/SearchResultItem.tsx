import type { MouseEvent, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "antd";
import AvatarFallback from "../../../components/AvatarFallback/AvatarFallback";
import type { SearchItem } from "../../../types/search.type";
import { StatusRequest } from "../../../types/user.type";
import type { StatusUser } from "../../../types/friend.type";
import styles from "./SearchResultItem.module.scss";

type Props = {
  item: SearchItem;
  keyword: string;
  onUserClick?: (userId: string, event: MouseEvent) => void;
};

const friendStatusLabel: Record<string, string> = {
  [StatusRequest.ONLINE]: "Trực tuyến",
  [StatusRequest.ACCEPTED]: "Bạn bè",
  [StatusRequest.REQUESTED]: "Đã gửi lời mời",
  [StatusRequest.RECEIVED]: "Có lời mời kết bạn",
};

export default function SearchResultItem({ item, keyword, onUserClick }: Props) {
  if (item.type === "user") {
    return <UserResultCard item={item} keyword={keyword} onUserClick={onUserClick} />;
  }
  return <WorkspaceResultCard item={item} keyword={keyword} />;
}

function UserResultCard({
  item,
  keyword,
  onUserClick,
}: {
  item: Extract<SearchItem, { type: "user" }>;
  keyword: string;
  onUserClick?: (userId: string, event: MouseEvent) => void;
}) {
  const navigate = useNavigate();
  const displayName = item.fullName || item.displayName || item.username;

  const handleClick = (e: MouseEvent) => {
    if (onUserClick) {
      onUserClick(item.id, e);
    } else {
      navigate(`/users/${item.id}`);
    }
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
            <span className={styles.nameHighlight}>{highlight(displayName, keyword)}</span>
          </div>
          <Badge color="blue" text="Người dùng" className={styles.badge} />
        </div>
        <div className={styles.meta}>
          {item.username && <span className={styles.username}>@{highlight(item.username, keyword)}</span>}
          {item.friendStatus && (
            <span className={styles.dot}>· {friendStatusLabel[item.friendStatus] || item.friendStatus}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkspaceResultCard({
  item,
  keyword,
}: {
  item: Extract<SearchItem, { type: "workspace" }>;
  keyword: string;
}) {
  const navigate = useNavigate();

  return (
    <div className={styles.item} onClick={() => navigate(`/workspaces/${item.name}-i-${item.id}`)}>
      <div className={styles.avatarWrap}>
        <AvatarFallback src={item.avatar || null} alt={item.name} showStatus={false} size={44} />
      </div>
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <div className={styles.name}>{highlight(item.name, keyword)}</div>
          <Badge color="purple" text="Không gian làm việc" className={styles.badge} />
        </div>
        {item.owner && (
          <div className={styles.description}>
            Chủ workspace: {item.owner.fullName || item.owner.username}
          </div>
        )}
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
