import { useCallback, useMemo, useState } from "react";
import { Modal } from "antd";
import { EditOutlined } from "@ant-design/icons";
import MenuItemSetting from "../MenuItemSetting/MenuItem";
import MemberNicknameRow from "./MemberNicknameRow";
import type { ChannelNicknameUpdate } from "../../types/channel.type";
import styles from "./SettingNickName.module.scss";
import type { MemberNickname } from "../CustomizeChannel/CustomizeChannel";

interface SettingNickNameProps {
  members: MemberNickname[];
  onSave: (payload: ChannelNicknameUpdate) => void | Promise<void>;
}

export default function SettingNickName({ members, onSave }: SettingNickNameProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [draftNicknames, setDraftNicknames] = useState<MemberNickname[]>([]);

  const handleOpen = () => {
    setDraftNicknames(members.map((member) => ({ ...member })));
    setModalOpen(true);
  };

  const handleCancel = () => {
    setModalOpen(false);
  };

  const handleNicknameChange = useCallback(
    (userId: string, nickname: string) => {
      setDraftNicknames((prev) =>
        prev.map((member) => (member.userId === userId ? { ...member, nickname } : member)),
      );
      onSave({ userId, nickname });
    },
    [onSave],
  );

  const memberRows = useMemo(
    () =>
      draftNicknames.map((member) => (
        <MemberNicknameRow key={member.userId} member={member} onNicknameChange={handleNicknameChange} />
      )),
    [draftNicknames, handleNicknameChange],
  );

  if (members.length === 0) return null;

  return (
    <div>
      <MenuItemSetting icon={<EditOutlined />} label="Chỉnh sửa biệt danh" onClick={handleOpen} />

      <Modal
        title="Chỉnh sửa biệt danh"
        open={modalOpen}
        onCancel={handleCancel}
        footer={null}
        centered
        width={500}
        destroyOnClose
      >
        <p className={styles.modalDesc}>{"Đặt biệt danh riêng cho từng thành viên trong kênh."}</p>

        <div className={`${styles.memberList} ${styles.memberListGroup}`}>{memberRows}</div>
      </Modal>
    </div>
  );
}
