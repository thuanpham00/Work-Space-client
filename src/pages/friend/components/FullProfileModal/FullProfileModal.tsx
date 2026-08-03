import React, { useImperativeHandle, useState } from "react";
import { Modal, Tabs, Button } from "antd";
import type { ChannelDM } from "../../../../types/channel.type";
import { MessageSquare, UserPlus, MoreHorizontal } from "lucide-react";
import AvatarFallback from "../../../../components/AvatarFallback/AvatarFallback";
import { formatDateString } from "../../../../utils/utils";
import styles from "./FullProfileModal.module.scss";

export interface FullProfileModalRef {
  openModal: () => void;
  closeModal: () => void;
}

interface FullProfileModalProps {
  channelDMDetail: ChannelDM;
}

export const FullProfileModal = React.forwardRef<FullProfileModalRef, FullProfileModalProps>(
  ({ channelDMDetail }, ref) => {
    const [visible, setVisible] = useState(false);
    console.log("channelDMDetail", channelDMDetail);

    useImperativeHandle(ref, () => ({
      openModal: () => setVisible(true),
      closeModal: () => setVisible(false),
    }));

    const friend = channelDMDetail?.friend;
    if (!friend) return null;

    const items = [
      {
        key: "2",
        label: "Bạn Chung",
        children: <div className={styles.tabContent}>Không có bạn chung</div>,
      },
      {
        key: "3",
        label: "Máy Chủ Chung",
        children: <div className={styles.tabContent}>ko có</div>,
      },
    ];

    return (
      <Modal
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={800}
        centered
        className={styles.fullProfileModal}
        closeIcon={<span className={styles.closeIcon}>X</span>}
      >
        <div className={styles.modalBody}>
          <div className={styles.leftPanel}>
            <div className={styles.banner} style={{ backgroundColor: "#2a4d38" }}></div>
            <div className={styles.avatarWrapper}>
              <AvatarFallback
                className={styles.avatarOverride}
                src={friend.avatar}
                alt={friend.username}
                size={60}
                status={friend.status as any}
                showStatus={true}
                statusStyle={{
                  bottom: "5px",
                  right: "5px",
                  width: "15px",
                  height: "15px",
                  border: "4px solid #232428",
                }}
              />
            </div>

            <div className={styles.userInfo}>
              <h2 className={styles.fullName}>{friend.fullName}</h2>
              <div className={styles.username}>@{friend.username}</div>

              <div className={styles.actions}>
                <Button type="primary" className={styles.messageBtn} icon={<MessageSquare size={16} />}>
                  Tin nhắn
                </Button>
                <Button className={styles.iconBtn} icon={<UserPlus size={16} />} />
                <Button className={styles.iconBtn} icon={<MoreHorizontal size={16} />} />
              </div>

              <div className={styles.infoSection}>
                <div className={styles.infoBlock}>
                  <div className={styles.infoTitle}>Gia Nhập Từ</div>
                  <div className={styles.infoText}>{formatDateString(friend.createdAt)}</div>
                </div>

                {friend.email && (
                  <div className={styles.infoBlock}>
                    <div className={styles.infoTitle}>Email</div>
                    <div className={styles.infoText}>
                      {friend.privacySettings?.showEmail ? friend.email : "********"}
                    </div>
                  </div>
                )}

                {friend.phone && (
                  <div className={styles.infoBlock}>
                    <div className={styles.infoTitle}>Số điện thoại</div>
                    <div className={styles.infoText}>
                      {friend.privacySettings?.showPhone ? friend.phone : "********"}
                    </div>
                  </div>
                )}

                {friend.gender && (
                  <div className={styles.infoBlock}>
                    <div className={styles.infoTitle}>Giới tính</div>
                    <div className={styles.infoText}>
                      {friend.privacySettings?.showGender ? (
                        friend.gender === "MALE" ? (
                          "Nam"
                        ) : friend.gender === "FEMALE" ? (
                          "Nữ"
                        ) : (
                          "Khác"
                        )
                      ) : (
                        <div className={styles.infoText}>********</div>
                      )}
                    </div>
                  </div>
                )}

                {friend.dateOfBirth && (
                  <div className={styles.infoBlock}>
                    <div className={styles.infoTitle}>Ngày sinh</div>
                    <div className={styles.infoText}>
                      {friend.privacySettings?.showBirthday ? (
                        formatDateString(friend.dateOfBirth)
                      ) : (
                        <div className={styles.infoText}>********</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className={styles.rightPanel}>
            <Tabs defaultActiveKey="3" items={items} className={styles.customTabs} />
          </div>
        </div>
      </Modal>
    );
  },
);
