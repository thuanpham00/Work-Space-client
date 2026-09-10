import { useRef } from "react";
import { Settings } from "lucide-react";
import { Button } from "antd";
import styles from "./InfoChannel.module.scss";
import type {
  Channel,
  ChannelMemberNickname,
  MemberChannel as MemberChannelType,
} from "../../../../types/channel.type";
import CustomizeChannel from "../../../../components/CustomizeChannel/CustomizeChannel";
import MediaChannel from "../../../../components/MediaChannel/MediaChannel";
import MemberChannel from "./section/MemberChannel";
import useScrollAttachments from "../../../../Hooks/useScrollAttachments";
import { useUserStore } from "../../../../store/userStore";
import ChannelSettingsModal, { type ChannelSettingsModalRef } from "../ChannelSettingsModal";

interface InfoChannelProps {
  channelDetail: Channel;
  accentChannel: string;
  backgroundUrlChannel: string;
  nickNames: ChannelMemberNickname[];
  members: MemberChannelType[];
}

export default function InfoChannel({
  channelDetail,
  accentChannel,
  backgroundUrlChannel,
  nickNames,
  members,
}: InfoChannelProps) {
  const token = useUserStore((app) => app.accessToken);
  const channelSettingsModalRef = useRef<ChannelSettingsModalRef>(null);

  const handleOpenSettings = () => {
    channelSettingsModalRef.current?.handleOpen();
  };

  const { attachments, pagination, fetchMore, setQuery, query } = useScrollAttachments({
    channelId: channelDetail.id,
    token: token as string,
  });

  return (
    <aside className={styles.infoChannelSidebar}>
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

      <CustomizeChannel
        channelDMDetail={channelDetail}
        backgroundUrlDM={backgroundUrlChannel}
        accentDM={accentChannel}
        nickNames={nickNames}
      />

      <MediaChannel
        attachments={attachments}
        pagination={pagination}
        fetchMore={fetchMore}
        query={query}
        setQuery={setQuery}
      />

      <MemberChannel members={members} />

      <ChannelSettingsModal
        ref={channelSettingsModalRef}
        channelName={channelDetail.name}
        onClose={() => console.log("Channel settings closed")}
      />
    </aside>
  );
}
