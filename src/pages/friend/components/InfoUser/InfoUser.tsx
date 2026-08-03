import { useRef } from "react";
import AvatarFallback from "../../../../components/AvatarFallback/AvatarFallback";
import type { ChannelDM } from "../../../../types/channel.type";
import { formatDateString } from "../../../../utils/utils";
import styles from "./InfoUser.module.scss";
import { FullProfileModal, type FullProfileModalRef } from "../FullProfileModal/FullProfileModal";

export default function InfoUser({ channelDMDetail }: { channelDMDetail: ChannelDM }) {
  const modalRef = useRef<FullProfileModalRef>(null);

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
          <p className={styles.sectionText}>1</p>
        </div>

        <div className={styles.profileSection}>
          <h4 className={styles.sectionHeader}>Gia nhập từ</h4>
          <p className={styles.sectionText}>{formatDateString(channelDMDetail.friend.createdAt)}</p>
        </div>

        <button className={styles.fullProfileBtn} onClick={() => modalRef.current?.openModal()}>
          Xem hồ sơ đầy đủ
        </button>
      </div>

      <FullProfileModal ref={modalRef} channelDMDetail={channelDMDetail} />
    </aside>
  );
}
