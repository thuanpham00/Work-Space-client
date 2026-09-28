import { StatusRequest } from "../../types/user.type";
import styles from "./FriendStatusPill.module.scss";

export type FriendStatusTone = "success" | "warning" | "info" | "default";

const FRIEND_STATUS_LABEL: Partial<Record<StatusRequest, string>> = {
  [StatusRequest.ONLINE]: "Trực tuyến",
  [StatusRequest.ACCEPTED]: "Bạn bè",
  [StatusRequest.REQUESTED]: "Đã gửi lời mời",
  [StatusRequest.RECEIVED]: "Có lời mời kết bạn",
};

const FRIEND_STATUS_TONE: Partial<Record<StatusRequest, FriendStatusTone>> = {
  [StatusRequest.ONLINE]: "success",
  [StatusRequest.ACCEPTED]: "success",
  [StatusRequest.REQUESTED]: "warning",
  [StatusRequest.RECEIVED]: "info",
};

type FriendStatusPillProps = {
  friendStatus?: StatusRequest | string | null;
  labelOverride?: Partial<Record<StatusRequest, string>>;
  toneOverride?: Partial<Record<StatusRequest, FriendStatusTone>>;
  fallback?: React.ReactNode;
};

export const FriendStatusPill = ({
  friendStatus,
  labelOverride,
  toneOverride,
  fallback = null,
}: FriendStatusPillProps) => {
  if (!friendStatus) return fallback;

  const key = friendStatus as StatusRequest;
  const tone = toneOverride?.[key] ?? FRIEND_STATUS_TONE[key] ?? "default";
  const label = labelOverride?.[key] ?? FRIEND_STATUS_LABEL[key];
  if (!label) return fallback;

  return <span className={`${styles.friendStatusPill} ${styles[`friendStatusTone_${tone}`]}`}>{label}</span>;
};
