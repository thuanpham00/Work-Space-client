import { useState } from "react";
import { Modal, Switch, Select, Input, Popconfirm, App } from "antd";
import { BellOff, Ban, Flag, Trash2 } from "lucide-react";
import styles from "./PrivacySection.module.scss";
import CollapsibleSection from "../../../../../components/CollapsibleSection/CollapsibleSection";
import MenuItemSetting from "../../../../../components/MenuItemSetting/MenuItem";

const REPORT_REASONS = [
  { value: "spam", label: "Spam hoặc lừa đảo" },
  { value: "harassment", label: "Quấy rối hoặc bắt nạt" },
  { value: "hate", label: "Ngôn ngữ gây thù ghét" },
  { value: "violence", label: "Bạo lực hoặc đe doạ" },
  { value: "inappropriate", label: "Nội dung không phù hợp" },
  { value: "other", label: "Khác" },
];

const PrivacySection = () => {
  const { notification } = App.useApp();

  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState<string>("");
  const [reportDescription, setReportDescription] = useState<string>("");

  const handleToggleMute = (checked: boolean) => {
    setIsMuted(checked);
    notification.success({
      message: checked ? "Đã tắt thông báo đoạn chat" : "Đã bật thông báo đoạn chat",
      placement: "topRight",
      duration: 6,
    });
  };

  const handleConfirmBlock = () => {
    setIsBlocked(true);
    notification.success({
      message: "Đã chặn người dùng này",
      placement: "topRight",
      duration: 6,
    });
  };

  const handleUnblock = () => {
    setIsBlocked(false);
    notification.success({
      message: "Đã bỏ chặn người dùng",
      placement: "topRight",
      duration: 6,
    });
  };

  const handleSubmitReport = () => {
    if (!reportReason) {
      notification.warning({
        message: "Vui lòng chọn lý do báo cáo",
        placement: "topRight",
        duration: 6,
      });
      return;
    }
    setReportModalOpen(false);
    setReportReason("");
    setReportDescription("");
    notification.success({
      message: "Đã gửi báo cáo. Cảm ơn bạn đã phản hồi",
      placement: "topRight",
      duration: 6,
    });
  };

  const handleConfirmDelete = () => {
    notification.success({
      message: "Đã xoá đoạn chat",
      placement: "topRight",
      duration: 6,
    });
  };

  return (
    <CollapsibleSection title="Quyền riêng tư và hỗ trợ">
      <MenuItemSetting
        icon={<BellOff size={18} />}
        label="Tắt thông báo đoạn chat"
        right={
          <Switch
            size="small"
            checked={isMuted}
            onChange={handleToggleMute}
            onClick={(_, e) => e.stopPropagation()}
          />
        }
      />

      {isBlocked ? (
        <MenuItemSetting icon={<Ban size={18} />} label="Bỏ chặn người dùng" onClick={handleUnblock} />
      ) : (
        <Popconfirm
          title="Chặn người dùng này?"
          description="Họ sẽ không thể gửi tin nhắn cho bạn trong đoạn chat này."
          okText="Chặn"
          cancelText="Huỷ"
          okButtonProps={{ danger: true }}
          onConfirm={handleConfirmBlock}
        >
          <MenuItemSetting icon={<Ban size={18} />} label="Chặn người dùng này" />
        </Popconfirm>
      )}

      <MenuItemSetting
        icon={<Flag size={18} />}
        label="Báo cáo đoạn chat"
        onClick={() => setReportModalOpen(true)}
      />

      <Popconfirm
        title="Xoá đoạn chat?"
        description="Hành động này không thể hoàn tác. Toàn bộ tin nhắn sẽ bị xoá."
        okText="Xoá"
        cancelText="Huỷ"
        okButtonProps={{ danger: true }}
        onConfirm={handleConfirmDelete}
      >
        <MenuItemSetting icon={<Trash2 size={18} />} label="Xoá đoạn chat" danger />
      </Popconfirm>

      <Modal
        title="Báo cáo đoạn chat"
        open={reportModalOpen}
        onOk={handleSubmitReport}
        onCancel={() => {
          setReportModalOpen(false);
          setReportReason("");
          setReportDescription("");
        }}
        okText="Gửi báo cáo"
        cancelText="Huỷ"
        centered
        width={480}
      >
        <p className={styles.modalDesc}>Giúp chúng tôi hiểu vấn đề. Báo cáo của bạn sẽ được giữ bí mật.</p>

        <div className={styles.formField}>
          <label className={styles.formLabel}>Lý do</label>
          <Select
            value={reportReason || undefined}
            onChange={setReportReason}
            placeholder="Chọn lý do báo cáo"
            options={REPORT_REASONS}
            style={{ width: "100%" }}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel}>Mô tả thêm (tuỳ chọn)</label>
          <Input.TextArea
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            placeholder="Cung cấp thêm thông tin chi tiết..."
            rows={4}
            maxLength={500}
            showCount
          />
        </div>
      </Modal>
    </CollapsibleSection>
  );
};

export default PrivacySection;
