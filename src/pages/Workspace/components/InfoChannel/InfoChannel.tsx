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
import type { Attachment } from "../../../../types/attachment.type";
import MemberChannel from "./section/MemberChannel";

interface InfoChannelProps {
  channelDetail: Channel;
  accentChannel: string;
  backgroundUrlChannel: string;
  backgroundColorChannel: string;
  nickNames: ChannelMemberNickname[];
  attachments: Attachment[];
  members: MemberChannelType[];
}

export default function InfoChannel({
  channelDetail,
  accentChannel,
  backgroundUrlChannel,
  backgroundColorChannel,
  nickNames,
  attachments,
  members,
}: InfoChannelProps) {
  const handleOpenSettings = () => {
    console.log("Open channel settings modal");
  };

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
        backgroundColorDM={backgroundColorChannel}
        accentDM={accentChannel}
        nickNames={nickNames}
      />

      <MediaChannel attachments={attachments} />

      <MemberChannel members={members} />
    </aside>
  );
}
