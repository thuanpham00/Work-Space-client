import { useRef } from "react";
import AvatarFallback from "../../../../components/AvatarFallback/AvatarFallback";
import type { ChannelDM } from "../../../../types/channel.type";
import styles from "./InfoUser.module.scss";
import { FullProfileModal, type FullProfileModalRef } from "../FullProfileModal/FullProfileModal";
import CustomizationSection from "./sections/CustomizationSection";
import PrivacySection from "./sections/PrivacySection";
import MediaSection from "./sections/MediaSection";
import { useUserStore } from "../../../../store/userStore";

interface InfoUserProps {
  channelDMDetail: ChannelDM;
  backgroundUrlDM: string;
  backgroundColorDM: string;
  accentDM: string;
  nickNames: any;
}

export default function InfoUser({
  channelDMDetail,
  backgroundUrlDM,
  backgroundColorDM,
  accentDM,
  nickNames,
}: InfoUserProps) {
  const modalRef = useRef<FullProfileModalRef>(null);
  const userId = useUserStore((app) => app.user.id);
  const nickName = channelDMDetail.nicknames.filter((nickname) => nickname.userId !== userId)[0]?.nickname;
  const displayName = nickName || channelDMDetail.friend.fullName;

  return (
    <aside className={styles.profileSidebar}>
      <div className={styles.profileBanner} style={{ backgroundColor: "#2a4d38" }}></div>

      <div className={styles.profileAvatarWrapper}>
        <div className={styles.profileAvatarContainer}>
          <AvatarFallback
            src={channelDMDetail.friend.avatar}
            alt={channelDMDetail.friend.username}
            size={60}
            status={channelDMDetail.friend.status as any}
            showStatus={true}
            statusStyle={{ bottom: "-1px", right: "4px" }}
            className={styles.avatarOverride}
          />
        </div>
      </div>

      <div className={styles.profileDetails}>
        <div className={styles.profileUserNames}>
          <h2 className={styles.profileDisplayName}>{displayName}</h2>
        </div>

        <button className={styles.fullProfileBtn} onClick={() => modalRef.current?.openModal()}>
          Xem hồ sơ đầy đủ
        </button>
      </div>

      <CustomizationSection
        channelDMDetail={channelDMDetail}
        backgroundUrlDM={backgroundUrlDM}
        backgroundColorDM={backgroundColorDM}
        accentDM={accentDM}
        nickNames={nickNames}
      />

      <MediaSection />

      <PrivacySection />

      <FullProfileModal ref={modalRef} channelDMDetail={channelDMDetail} />
    </aside>
  );
}
