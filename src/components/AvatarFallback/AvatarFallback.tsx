import type { CSSProperties } from "react";
import styles from "./AvatarFallback.module.scss";
import type { StatusUser } from "../../types/friend.type";

interface AvatarFallbackProps {
  src?: string | null;
  alt: string;
  size?: number;
  status?: StatusUser;
  showStatus?: boolean;
  className?: string;
  /** inline style cho status dot - dùng thay classNameStatus khi cần override position */
  statusStyle?: CSSProperties;
}

export default function AvatarFallback({
  src,
  alt,
  className,
  statusStyle,
  size = 36,
  status,
  showStatus = true,
}: AvatarFallbackProps) {
  const sizeStyle = { width: size, height: size, fontSize: size * 0.4 };
  const letter = alt?.trim().charAt(0).toUpperCase() || "?";

  const statusClass =
    status === "ONLINE" ? styles.statusOnline : status === "BUSY" ? styles.statusBusy : styles.statusOffline;

  return (
    <div className={`${styles.avatarWrapper} ${className ?? ""}`}>
      {src ? (
        <img src={src} alt={alt} className={styles.avatar} style={sizeStyle} />
      ) : (
        <div className={styles.avatarFallback} style={sizeStyle}>
          {letter}
        </div>
      )}
      {showStatus && <span className={`${styles.statusDot} ${statusClass}`} style={statusStyle} />}
    </div>
  );
}
