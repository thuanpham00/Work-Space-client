import AvatarFallback from "../../../../components/AvatarFallback/AvatarFallback";
import type { ChannelDM } from "../../../../types/channel.type";
import styles from "./InfoUser.module.scss";

export default function InfoUser({ channelDMDetail }: { channelDMDetail: ChannelDM }) {
  return (
    <aside className={styles.profileSidebar}>
      <div className={styles.profileBanner} style={{ backgroundColor: "#2a4d38" }}></div>

      <div className={styles.profileAvatarWrapper}>
        <div className={styles.profileAvatarContainer}>
          <AvatarFallback
            src={channelDMDetail.friend.avatar}
            alt={channelDMDetail.friend.username}
            size={50}
            status={channelDMDetail.friend.status as any}
            showStatus={true}
            statusStyle={{ bottom: "-16px", right: "-14px" }}
          />
        </div>
      </div>

      <div className={styles.profileDetails}>
        <div className={styles.profileUserNames}>
          <h2 className={styles.profileDisplayName}>{channelDMDetail.friend.fullName}</h2>
          <p className={styles.profileUsername}>@{channelDMDetail.friend.username}</p>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.profileSection}>
          <h4 className={styles.sectionHeader}>Thành viên chung</h4>
          <p className={styles.sectionText}>
            {/* {mockUser.mutualFriends} Bạn Chung • {mockUser.mutualServers} Máy Chủ Chung */}
          </p>
        </div>

        <div className={styles.profileSection}>
          <h4 className={styles.sectionHeader}>Gia nhập từ</h4>
          <p className={styles.sectionText}>Trống</p>
        </div>

        <button className={styles.fullProfileBtn}>Xem hồ sơ đầy đủ</button>
      </div>
    </aside>
  );
}
