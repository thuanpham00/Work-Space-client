import { Settings, Crown } from "lucide-react";
import styles from "./InfoChannel.module.scss";
import type { Channel } from "../../../types/channel.type";
import AvatarFallback from "../../../components/AvatarFallback/AvatarFallback";
import { Button } from "antd";

interface InfoChannelProps {
  channelDetail: Channel;
}

// Data cứng mô phỏng danh sách thành viên trong channel
const MOCK_ONLINE_MEMBERS = [
  {
    id: "1",
    displayName: "BMD BOT",
    username: "bmd_bot",
    avatar: "",
    status: "online",
    isBot: true,
  },
  {
    id: "2",
    displayName: "Dung Thuỳ",
    username: "dungthuy",
    avatar: "",
    status: "idle",
  },
  {
    id: "3",
    displayName: "Sơn Phạm BMD Solution",
    username: "sonpham",
    avatar: "",
    status: "idle",
    isOwner: true,
  },
  {
    id: "4",
    displayName: "thanhchuong.bmd",
    username: "thanhchuong",
    avatar: "",
    status: "online",
  },
  {
    id: "5",
    displayName: "thuanphammm",
    username: "thuanpham",
    avatar: "",
    status: "online",
  },
  {
    id: "6",
    displayName: "Đỗ Phúc",
    username: "dophuc",
    avatar: "",
    status: "idle",
    customStatus: "💀 SEAF",
  },
];

const MOCK_OFFLINE_MEMBERS = [
  {
    id: "7",
    displayName: "BMD Report Bot",
    username: "bmd_report",
    avatar: "",
    status: "offline",
    isBot: true,
  },
  {
    id: "8",
    displayName: "ngocnam",
    username: "ngocnam",
    avatar: "",
    status: "offline",
  },
  {
    id: "9",
    displayName: "Nhật Quang",
    username: "nhatquang",
    avatar: "",
    status: "offline",
  },
];

export default function InfoChannel({ channelDetail }: InfoChannelProps) {
  const handleOpenSettings = () => {
    console.log("Open channel settings modal");
  };

  return (
    <aside className={styles.infoChannelSidebar}>
      {/* Header của Panel */}
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Thông tin kênh</span>
        <Button
          type="text"
          icon={<Settings size={18} />}
          onClick={handleOpenSettings}
          className={styles.settingsBtn}
          title="Cài đặt kênh"
        />
      </div>

      <div className={styles.scrollableContent}>
        {/* Nhóm Trực tuyến */}
        <div className={styles.memberGroupSection}>
          <h3 className={styles.groupTitle}>Trực tuyến — {MOCK_ONLINE_MEMBERS.length}</h3>
          <ul className={styles.memberList}>
            {MOCK_ONLINE_MEMBERS.map((member) => (
              <li className={styles.memberItem} key={member.id}>
                <div className={styles.avatarWrapper}>
                  <AvatarFallback
                    src={member.avatar}
                    alt={member.displayName}
                    size={32}
                    status={member.status as any}
                    showStatus={true}
                  />
                </div>
                <div className={styles.memberInfo}>
                  <div className={styles.nameRow}>
                    <span className={styles.displayName}>{member.displayName}</span>
                    {member.isBot && <span className={styles.botBadge}>APP</span>}
                    {member.isOwner && <Crown size={14} className={styles.ownerIcon} />}
                  </div>
                  {member.customStatus && (
                    <span className={styles.customStatusBadge}>{member.customStatus}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Nhóm Ngoại tuyến */}
        <div className={styles.memberGroupSection}>
          <h3 className={styles.groupTitle}>Ngoại tuyến — {MOCK_OFFLINE_MEMBERS.length}</h3>
          <ul className={styles.memberList}>
            {MOCK_OFFLINE_MEMBERS.map((member) => (
              <li className={`${styles.memberItem} ${styles.offline}`} key={member.id}>
                <div className={styles.avatarWrapper}>
                  <AvatarFallback
                    src={member.avatar}
                    alt={member.displayName}
                    size={32}
                    status={member.status as any}
                    showStatus={true}
                  />
                </div>
                <div className={styles.memberInfo}>
                  <div className={styles.nameRow}>
                    <span className={styles.displayName}>{member.displayName}</span>
                    {member.isBot && <span className={styles.botBadge}>APP</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
