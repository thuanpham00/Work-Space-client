import type { ReactNode } from "react";
import AvatarFallback from "../../../components/AvatarFallback/AvatarFallback";
import { FriendStatusPill } from "../../../components/FriendStatusPill/FriendStatusPill";
import styles from "./SearchResultItem.module.scss";
import type { ChannelSearchType } from "../../../types/channel.type";
import type { UserType } from "../../../types/user.type";

type Props = {
  item: UserType | ChannelSearchType;
  keyword: string;
  onUserClick: (userId: string, type: "user" | "channel") => void;
};

export default function SearchResultItem({ item, keyword, onUserClick }: Props) {
  if ((item as UserType)?.type === "user") {
    return <UserResultCard item={item as UserType} keyword={keyword} onUserClick={onUserClick} />;
  }
  return <ChannelResultCard item={item as ChannelSearchType} keyword={keyword} onUserClick={onUserClick} />;
}

function UserResultCard({
  item,
  keyword,
  onUserClick,
}: {
  item: UserType;
  keyword: string;
  onUserClick: (userId: string, type: "user" | "channel") => void;
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

function ChannelResultCard({
  item,
  keyword,
  onUserClick,
}: {
  item: ChannelSearchType;
  keyword: string;
  onUserClick?: (userId: string, type: "user" | "channel") => void;
}) {
  const handleClick = () => {
    onUserClick?.(item.id, "channel");
  };

  const isPrivate = item.type === "DM" || item.description?.toLowerCase().includes("private");
  const roleLabel =
    item.channelMemberStatus === "ADMIN"
      ? "Quản trị viên"
      : item.channelMemberStatus === "MEMBER"
        ? "Thành viên"
        : null;

  return (
    <div className={styles.item} onClick={handleClick}>
      <div className={styles.avatarWrap}>
        <AvatarFallback src={null} alt={item.name} showStatus={false} size={44} />
      </div>
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <div className={styles.name}>
            <span className={styles.nameText}>
              <span className={styles.hash}>#</span>
              {highlight(item.name, keyword)}
            </span>
            {isPrivate && <span className={styles.privateTag}>Riêng tư</span>}
            {roleLabel && <span className={styles.roleTag}>{roleLabel}</span>}
          </div>
        </div>
        <div className={styles.meta}>
          {item.workspaceName && (
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Workspace: </span>
              <span className={styles.metaValue}>
                {highlight(item.workspaceName, keyword)}
              </span>
            </div>
          )}
          {item.description && (
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Mô tả: </span>
              <span className={styles.metaValue}>{item.description}</span>
            </div>
          )}
          {item.workspaceOwner && (
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Chủ workspace: </span>
              <span className={styles.metaValue}>{item.workspaceOwner}</span>
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
