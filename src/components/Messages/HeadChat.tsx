import { Hash, Lock } from "lucide-react";
import AvatarFallback from "../AvatarFallback/AvatarFallback";
import type { StatusUser } from "../../types/friend.type";
import styles from "./HeadChat.module.scss";

export interface HeadChatProps {
  mode: "dm" | "group";
  name: string;
  subtitle?: string;
  avatar?: string;
  status?: string;
  isPrivate?: boolean;
}

const HeadChat = ({ mode, name, subtitle, avatar, status, isPrivate }: HeadChatProps) => {
  if (mode === "dm") {
    return (
      <div className={styles.emptyState}>
        <AvatarFallback src={avatar} alt={name} status={status as StatusUser} showStatus={false} size={54} />
        <h2 className={styles.title}>{name}</h2>
        {subtitle && <p className={styles.subtitle}>@{subtitle}</p>}
        <div className={styles.divider} />
        <p className={styles.description}>
          Đây là điểm khởi đầu của lịch sử tin nhắn riêng tư giữa bạn và{" "}
          <span className={styles.highlight}>{name}</span>.
        </p>
      </div>
    );
  }

  const channelLabel = `#${name}`;

  return (
    <div className={styles.emptyState}>
      <div className={styles.iconCircle}>{isPrivate ? <Lock size={36} /> : <Hash size={36} />}</div>
      <h2 className={styles.title}>{channelLabel}</h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      <div className={styles.divider} />
      <p className={styles.description}>
        Chào mừng đến với <span className={styles.highlight}>{channelLabel}</span>! Đây là điểm khởi đầu của
        kênh này.
      </p>
    </div>
  );
};

export default HeadChat;
