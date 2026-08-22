import { useState } from "react";
import { App, Input, Modal } from "antd";
import AvatarFallback from "../AvatarFallback/AvatarFallback";
import styles from "./SettingNickName.module.scss";
import type { MemeberNickname } from "../../pages/Friend/components/InfoUser/sections/CustomizationSection";

const NICKNAME_MAX_LENGTH = 32;

interface MemberNicknameRowProps {
  member: MemeberNickname;
  onNicknameChange: (userId: string, nickname: string) => void;
}

export default function MemberNicknameRow({ member, onNicknameChange }: MemberNicknameRowProps) {
  const { message } = App.useApp();
  const [editOpen, setEditOpen] = useState(false);
  const [draftValue, setDraftValue] = useState("");

  const handleOpenEdit = () => {
    setDraftValue(member.nickname || member.fullName);
    setEditOpen(true);
  };

  const handleCancelEdit = () => {
    setEditOpen(false);
  };

  const handleSaveEdit = () => {
    const trimmed = draftValue.trim();
    if (!trimmed) {
      message.warning("Biệt danh không được để trống");
      return;
    }
    if (trimmed.length > NICKNAME_MAX_LENGTH) {
      message.warning(`Biệt danh tối đa ${NICKNAME_MAX_LENGTH} ký tự`);
      return;
    }

    onNicknameChange(member.userId, trimmed);
    setEditOpen(false);
  };

  return (
    <>
      <button type="button" onClick={handleOpenEdit} className={styles.memberRow}>
        <AvatarFallback src={member.avatar} alt={member.fullName} size={40} showStatus={false} />

        <div className={styles.memberFields}>
          <div className={styles.memberMeta}>
            <span className={styles.memberName}>{member.fullName}</span>
            <span className={`${styles.memberNickname} ${!member.nickname ? styles.memberNicknameEmpty : ""}`}>
              {member.nickname || "Đặt biệt danh"}
            </span>
          </div>
        </div>
      </button>

      <Modal
        title="Đặt biệt danh"
        open={editOpen}
        onOk={handleSaveEdit}
        onCancel={handleCancelEdit}
        okText="Lưu"
        cancelText="Huỷ"
        centered
        width={400}
        destroyOnClose
      >
        <p className={styles.editModalDesc}>
          Biệt danh cho <strong>{member.fullName}</strong> trong đoạn chat này (chỉ bạn nhìn thấy).
        </p>
        <Input
          value={draftValue}
          onChange={(e) => setDraftValue(e.target.value)}
          placeholder="Nhập biệt danh"
          maxLength={NICKNAME_MAX_LENGTH}
          autoFocus
        />
      </Modal>
    </>
  );
}
