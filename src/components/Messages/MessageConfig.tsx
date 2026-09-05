import { useMemo } from "react";
import styles from "./MessageConfig.module.scss";
import { useUserStore } from "../../store/userStore";
import type { UserType } from "../../types/user.type";

interface MessageConfigProps {
  config: {
    action: string;
    targetUserName?: string;
    targetNickname?: string;
    targetUserId?: string;
  };
  sender: UserType;
}

const getLastName = (fullName?: string) => {
  if (!fullName?.trim()) return "-";
  const parts = fullName.trim().split(" ");
  return parts[parts.length - 1];
};

const buildNicknameMessage = ({
  isMe,
  isTargetMe,
  senderName,
  targetName,
  nickname,
}: {
  isMe: boolean;
  isTargetMe: boolean;
  senderName: string;
  targetName: string;
  nickname?: string;
}) => {
  const isRemoving = !nickname?.trim();

  if (isRemoving) {
    if (isMe && isTargetMe) return "Bạn đã xóa biệt danh của bạn";
    if (isMe && !isTargetMe) return `Bạn đã xóa biệt danh của ${targetName}`;
    if (isTargetMe) return `${senderName} đã xóa biệt danh của bạn`;
    return `${senderName} đã xóa biệt danh của ${targetName}`;
  }

  if (isMe && isTargetMe) return `Bạn đã đặt biệt danh cho bạn là ${nickname}`;
  if (isMe && !isTargetMe) return `Bạn đã đặt biệt danh cho ${targetName} là ${nickname}`;
  if (isTargetMe) return `${senderName} đã đặt biệt danh cho bạn là ${nickname}`;
  return `${senderName} đã đặt biệt danh cho ${targetName} là ${nickname}`;
};

export default function MessageConfig({ config, sender }: MessageConfigProps) {
  const userId = useUserStore((state) => state.user?.id);

  const contentMessage = useMemo(() => {
    const isMe = sender.id === userId;
    const isTargetMe = config.targetUserId === userId;
    const senderName = getLastName(sender.fullName);
    const targetName = getLastName(config.targetUserName);

    if (config.action === "channel_settings_updated") {
      return isMe
        ? "Bạn đã cập nhật tuỳ chỉnh đoạn chat"
        : `${senderName} đã cập nhật tuỳ chỉnh đoạn chat`;
    }

    if (config.action === "channel_nicknames_updated") {
      return buildNicknameMessage({
        isMe,
        isTargetMe,
        senderName,
        targetName,
        nickname: config.targetNickname,
      });
    }

    return "";
  }, [config, sender, userId]);

  if (!contentMessage) return null;

  return <div className={styles.messageConfig}>{contentMessage}</div>;
}
