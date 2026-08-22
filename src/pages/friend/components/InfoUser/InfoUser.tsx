import { useRef, useState } from "react";
import AvatarFallback from "../../../../components/AvatarFallback/AvatarFallback";
import type { ChannelDM } from "../../../../types/channel.type";
import styles from "./InfoUser.module.scss";
import { FullProfileModal, type FullProfileModalRef } from "../FullProfileModal/FullProfileModal";
import CustomizationSection from "./sections/CustomizationSection";
import PrivacySection from "./sections/PrivacySection";
import MediaSection from "./sections/MediaSection";

interface InfoUserProps {
  channelDMDetail: ChannelDM;
  backgroundUrlDM: string;
  backgroundColorDM: string;
  accentDM: string;
}

export default function InfoUser({
  channelDMDetail,
  backgroundUrlDM,
  backgroundColorDM,
  accentDM,
}: InfoUserProps) {
  const modalRef = useRef<FullProfileModalRef>(null);
  const [nickname, setNickname] = useState<string>(channelDMDetail.friend.fullName);

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
          <h2 className={styles.profileDisplayName}>{nickname}</h2>
          <p className={styles.profileUsername}>@{channelDMDetail.friend.username}</p>
        </div>

        <button className={styles.fullProfileBtn} onClick={() => modalRef.current?.openModal()}>
          Xem hồ sơ đầy đủ
        </button>
      </div>

      <CustomizationSection
        channelDMDetail={channelDMDetail}
        onNicknameChange={setNickname}
        backgroundUrlDM={backgroundUrlDM}
        backgroundColorDM={backgroundColorDM}
        accentDM={accentDM}
      />

      <MediaSection />

      <PrivacySection />

      <FullProfileModal ref={modalRef} channelDMDetail={channelDMDetail} />
    </aside>
  );
}
