import type { ReactNode } from "react";
import AvatarFallback from "../../../components/AvatarFallback/AvatarFallback";
import { FriendStatusPill } from "../../../components/FriendStatusPill/FriendStatusPill";
import { WorkspaceStatusPill } from "../../../components/WorkspaceStatusPill/WorkspaceStatusPill";
import type { SearchItem } from "../../../types/search.type";
import styles from "./SearchResultItem.module.scss";

type Props = {
  item: SearchItem;
  keyword: string;
  onUserClick?: (userId: string, type: "user" | "workspace") => void;
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
          // status={item.status as StatusUser}
          size={44}
        />
      </div>
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <div className={styles.name}>
            <span className={styles.nameText}>{highlight(displayName, keyword)}</span>
            <FriendStatusPill friendStatus={item.friendStatus} />
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
            <WorkspaceStatusPill workspaceStatus={item.workspaceStatus} />
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
