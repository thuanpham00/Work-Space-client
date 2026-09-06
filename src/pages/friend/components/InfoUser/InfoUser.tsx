/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useRef } from "react";
import AvatarFallback from "../../../../components/AvatarFallback/AvatarFallback";
import type { Channel, ChannelMemberNickname } from "../../../../types/channel.type";
import styles from "./InfoUser.module.scss";
import { FullProfileModal, type FullProfileModalRef } from "../FullProfileModal/FullProfileModal";
import PrivacySection from "./sections/PrivacySection";
import { useUserStore } from "../../../../store/userStore";
import type { Attachment } from "../../../../types/attachment.type";
import CustomizeChannel from "../../../../components/CustomizeChannel/CustomizeChannel";
import MediaChannel from "../../../../components/MediaChannel/MediaChannel";

interface InfoUserProps {
  channelDMDetail: Channel;
  backgroundUrlDM: string;
  accentDM: string;
  nickNames: ChannelMemberNickname[];
  attachments: Attachment[];
}

export default function InfoUser({
  channelDMDetail,
  backgroundUrlDM,
  accentDM,
  nickNames,
  attachments,
}: InfoUserProps) {
  const modalRef = useRef<FullProfileModalRef>(null);
  const userId = useUserStore((app) => app.user?.id);
  const nickName = channelDMDetail.nicknames.filter((nickname) => nickname.userId !== userId)[0]?.nickname;
  const infoReceiver = channelDMDetail.members?.find((member) => member.userId !== userId);
  const displayName = nickName || infoReceiver?.fullName;

  const bannerStyle = useMemo(() => {
    if (backgroundUrlDM) {
      return { backgroundImage: `url(${backgroundUrlDM})` };
    }
    if (accentDM) {
      return { backgroundColor: accentDM };
    }
    return undefined;
  }, [backgroundUrlDM, accentDM]);

  return (
    <aside className={styles.profileSidebar}>
      <div
        className={`${styles.profileBanner} ${!backgroundUrlDM && !accentDM ? styles.profileBannerFallback : ""}`}
        style={bannerStyle}
      />

      <div className={styles.profileAvatarWrapper}>
        <div className={styles.profileAvatarContainer}>
          <AvatarFallback
            src={infoReceiver?.avatar}
            alt={infoReceiver?.username}
            size={60}
            status={infoReceiver?.status as any}
            showStatus={false}
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

      <CustomizeChannel
        channelDMDetail={channelDMDetail}
        backgroundUrlDM={backgroundUrlDM}
        accentDM={accentDM}
        nickNames={nickNames}
      />

      <MediaChannel attachments={attachments} />

      <PrivacySection />

      <FullProfileModal
        ref={modalRef}
        channelDMDetail={channelDMDetail}
        backgroundUrlDM={backgroundUrlDM}
        accentDM={accentDM}
      />
    </aside>
  );
}
