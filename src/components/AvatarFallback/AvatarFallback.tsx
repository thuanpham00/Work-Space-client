import type { CSSProperties } from "react";
import styles from "./AvatarFallback.module.scss";
import type { StatusUser } from "../../types/friend.type";

const COLOR_PALETTES: [string, string][] = [
  ["#5b6cff", "#22c55e"],
  ["#f59e0b", "#ef4444"],
  ["#06b6d4", "#8b5cf6"],
  ["#ec4899", "#f97316"],
  ["#14b8a6", "#3b82f6"],
  ["#a855f7", "#f43f5e"],
  ["#22d3ee", "#84cc16"],
  ["#fb923c", "#f87171"],
  ["#4ade80", "#60a5fa"],
  ["#c084fc", "#fb7185"],
];

function pickPalette(seed: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLOR_PALETTES[Math.abs(hash) % COLOR_PALETTES.length];
}

interface AvatarFallbackProps {
  src?: string | null;
  alt: string;
  size?: number;
  status?: StatusUser;
  showStatus?: boolean;
  className?: string;
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
        <div
          className={styles.avatarFallback}
          style={{ ...sizeStyle, background: `linear-gradient(135deg, ${pickPalette(alt).join(", ")})` }}
        >
          {letter}
        </div>
      )}
      {showStatus && <span className={`${styles.statusDot} ${statusClass}`} style={statusStyle} />}
    </div>
  );
}
