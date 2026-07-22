import styles from "./InfoUser.module.scss";

export const mockUser = {
  id: "user-1",
  username: "hoang_son1999",
  displayName: "Hồ Hoàng Sơn",
  avatar: "https://i.pravatar.cc/150?img=12",
  bannerColor: "#2a4d38", // Sage dark green banner
  joinDate: "1 thg 4, 2020",
  mutualFriends: 2,
  mutualServers: 2,
  status: "ONLINE",
  bio: "Đang làm việc tại BMD Solutions 👾 OvO",
};

export default function InfoUser() {
  return (
    <aside className={styles.profileSidebar}>
      <div className={styles.profileBanner} style={{ backgroundColor: mockUser.bannerColor }}></div>

      <div className={styles.profileAvatarWrapper}>
        <div className={styles.profileAvatarContainer}>
          <img src={mockUser.avatar} alt={mockUser.displayName} className={styles.profileAvatarImg} />
          <div className={styles.profileStatusDot}></div>
        </div>
      </div>

      <div className={styles.profileDetails}>
        <div className={styles.profileUserNames}>
          <h2 className={styles.profileDisplayName}>{mockUser.displayName}</h2>
          <p className={styles.profileUsername}>{mockUser.username}</p>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.profileSection}>
          <h4 className={styles.sectionHeader}>Thành viên chung</h4>
          <p className={styles.sectionText}>
            {mockUser.mutualFriends} Bạn Chung • {mockUser.mutualServers} Máy Chủ Chung
          </p>
        </div>

        <div className={styles.profileSection}>
          <h4 className={styles.sectionHeader}>Gia nhập từ</h4>
          <p className={styles.sectionText}>{mockUser.joinDate}</p>
        </div>

        <button className={styles.fullProfileBtn}>Xem hồ sơ đầy đủ</button>
      </div>
    </aside>
  );
}
