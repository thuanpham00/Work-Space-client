import { useMemo, useState } from "react";
import { Modal, Input, App } from "antd";
import { EditOutlined } from "@ant-design/icons";
import type { ChannelDM } from "../../../../../types/channel.type";
import styles from "./CustomizationSection.module.scss";
import CollapsibleSection from "../../../../../components/CollapsibleSection/CollapsibleSection";
import MenuItemSetting from "../../../../../components/MenuItemSetting/MenuItem";
import ChangeBackgroundChannel from "../../../../../components/ChangeBackgroundChannel/ChangeBackgroundChannel";

interface CustomizationSectionProps {
  channelDMDetail: ChannelDM;
  onNicknameChange?: (nickname: string) => void;
  backgroundUrlDM: string;
  backgroundColorDM: string;
  accentDM: string;
}

const CustomizationSection = ({
  channelDMDetail,
  onNicknameChange,
  backgroundUrlDM,
  backgroundColorDM,
  accentDM,
}: CustomizationSectionProps) => {
  const { message } = App.useApp();
  const [nicknameModalOpen, setNicknameModalOpen] = useState(false);

  const [nicknameDraft, setNicknameDraft] = useState<string>(channelDMDetail.friend.fullName);

  const configChannel = useMemo(
    () => ({ backgroundUrl: backgroundUrlDM, backgroundColor: backgroundColorDM, accent: accentDM }),
    [backgroundUrlDM, backgroundColorDM, accentDM],
  );

  const handleSaveNickname = () => {
    const trimmed = nicknameDraft.trim();
    if (!trimmed) {
      message.warning("Biệt danh không được để trống");
      return;
    }
    onNicknameChange?.(trimmed);
    setNicknameModalOpen(false);
    message.success("Đã cập nhật biệt danh");
  };

  const handleThemeChange = (backgroundUrl: string, backgroundColor: string, accent: string) => {
    console.log("backgroundUrl", backgroundUrl);
    console.log("backgroundColor", backgroundColor);
    console.log("accent", accent);
  };

  return (
    <CollapsibleSection title="Tuỳ chỉnh đoạn chat">
      <ChangeBackgroundChannel onThemeChange={handleThemeChange} configChannel={configChannel} />

      <MenuItemSetting
        icon={<EditOutlined />}
        label="Chỉnh sửa biệt danh"
        onClick={() => setNicknameModalOpen(true)}
      />

      <Modal
        title="Chỉnh sửa biệt danh"
        open={nicknameModalOpen}
        onOk={handleSaveNickname}
        onCancel={() => {
          setNicknameDraft(channelDMDetail.friend.fullName);
          setNicknameModalOpen(false);
        }}
        okText="Lưu"
        cancelText="Huỷ"
        centered
      >
        <p className={styles.modalDesc}>Đặt biệt danh riêng cho người dùng này trong đoạn chat.</p>
        <Input
          value={nicknameDraft}
          onChange={(e) => setNicknameDraft(e.target.value)}
          placeholder="Nhập biệt danh"
          maxLength={32}
          autoFocus
        />
      </Modal>
    </CollapsibleSection>
  );
};

export default CustomizationSection;
