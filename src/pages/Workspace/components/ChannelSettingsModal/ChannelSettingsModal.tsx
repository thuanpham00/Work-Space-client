import { forwardRef, useImperativeHandle, useState } from "react";
import { Menu, type MenuProps, Modal } from "antd";
import { BellOutlined, InfoCircleOutlined, SettingOutlined, TeamOutlined } from "@ant-design/icons";
import styles from "./ChannelSettingsModal.module.scss";
import ChannelInfoForm from "./section/ChannelInfoForm";
import { useQuery } from "react-query";
import { channelApi } from "../../../../apis/channel.api";
import type { Channel } from "../../../../types/channel.type";

export type ChannelSettingsModalRef = {
  handleOpen: () => void;
  handleClose: () => void;
};

interface ChannelSettingsModalProps {
  channelId: string;
  channelName?: string;
  onClose?: () => void;
}

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  {
    key: "general",
    label: "Tổng quan",
    icon: <InfoCircleOutlined />,
    children: [
      { key: "info", label: "Thông tin kênh" },
      { key: "privacy", label: "Quyền riêng tư" },
    ],
  },
  {
    key: "members",
    label: "Thành viên",
    icon: <TeamOutlined />,
    children: [
      { key: "member-list", label: "Danh sách thành viên" },
      { key: "invite", label: "Mời thành viên" },
      { key: "role", label: "Phân quyền" },
    ],
  },
  {
    key: "notifications",
    label: "Thông báo",
    icon: <BellOutlined />,
    children: [{ key: "noti-setting", label: "Cài đặt thông báo" }],
  },
  {
    key: "advanced",
    label: "Nâng cao",
    icon: <SettingOutlined />,
    children: [{ key: "delete", label: "Xóa kênh" }],
  },
];

const ChannelSettingsModal = forwardRef<ChannelSettingsModalRef, ChannelSettingsModalProps>(
  ({ channelId, channelName = "kênh", onClose }, ref) => {
    const [open, setOpen] = useState(false);
    const [activeKey, setActiveKey] = useState<string>("info");
    const [openKeys, setOpenKeys] = useState<string[]>(["general"]);

    // Query chi tiết kênh
    const { data: channelDetail, isLoading } = useQuery({
      queryKey: ["channel-detail", channelId],
      queryFn: () => channelApi.getChannelDetail(channelId),
      staleTime: 1000 * 60 * 5,
    });

    const channel: Channel | undefined = channelDetail?.data.data.channel;

    useImperativeHandle(ref, () => ({
      handleOpen: () => setOpen(true),
      handleClose: () => setOpen(false),
    }));

    const handleClick: MenuProps["onClick"] = ({ key }) => {
      setActiveKey(key);
    };

    const handleCancel = () => {
      setOpen(false);
      onClose?.();
    };

    const renderContent = () => {
      if (activeKey === "info") {
        return <ChannelInfoForm channel={channel!} isLoading={isLoading} onCancel={handleCancel} />;
      }

      return (
        <div className={styles.placeholder}>
          <div className={styles.placeholderIcon}>
            <SettingOutlined />
          </div>
          <h3 className={styles.placeholderTitle}>Cài đặt {channelName}</h3>
          <p className={styles.placeholderDesc}>
            Nội dung cho mục <strong>{activeKey}</strong> sẽ được implement sau
          </p>
          <div className={styles.placeholderBadge}>{activeKey}</div>
        </div>
      );
    };

    return (
      <Modal
        open={open}
        onCancel={handleCancel}
        footer={null}
        width="90vw"
        height="90vh"
        centered
        destroyOnClose
        className={styles.modal}
        title={"Cài đặt kênh"}
      >
        <div className={styles.wrapper}>
          <Menu
            mode="inline"
            items={items}
            selectedKeys={[activeKey]}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            onClick={handleClick}
            defaultOpenKeys={["general"]}
            className={styles.menu}
          />

          <div className={styles.content}>{renderContent()}</div>
        </div>
      </Modal>
    );
  },
);

ChannelSettingsModal.displayName = "ChannelSettingsModal";

export default ChannelSettingsModal;
