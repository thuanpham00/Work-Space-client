import { useMemo, useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "antd";
import styles from "./InfoChannel.module.scss";
import type {
  Channel,
  MemberChannel,
  NicknameMember,
  ChannelNicknameUpdate,
  ChannelNicknamesBody,
  ChannelMemberNickname,
} from "../../../types/channel.type";
import CollapsibleSection from "../../../components/CollapsibleSection/CollapsibleSection";
import SettingNickName from "../../../components/SettingNickName/SettingNickName";
import { useMutation } from "react-query";
import { channelApi } from "../../../apis/channel.api";
import { useUserStore } from "../../../store/userStore";
import ChangeBackgroundChannel from "../../../components/ChangeBackgroundChannel/ChangeBackgroundChannel";

interface InfoChannelProps {
  channelDetail: Channel;
  accentChannel: string;
  backgroundUrlChannel: string;
  backgroundColorChannel: string;
  nickNames: ChannelMemberNickname[];
}

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

const mapMemberChannelToNicknameMember = (member: MemberChannel): NicknameMember => ({
  userId: member.userId,
  username: member.username,
  displayName: member.displayName,
  avatar: member.avatar,
  status: member.status,
});

const mapMockMemberToNicknameMember = (member: (typeof MOCK_ONLINE_MEMBERS)[number]): NicknameMember => ({
  userId: member.id,
  username: member.username,
  displayName: member.displayName,
  avatar: member.avatar,
  status: member.status,
});

export default function InfoChannel({
  channelDetail,
  accentChannel,
  backgroundUrlChannel,
  backgroundColorChannel,
  nickNames,
}: InfoChannelProps) {
  const members = useMemo<NicknameMember[]>(() => {
    if (channelDetail.members?.length) {
      return channelDetail.members.map(mapMemberChannelToNicknameMember);
    }

    return [...MOCK_ONLINE_MEMBERS, ...MOCK_OFFLINE_MEMBERS].map(mapMockMemberToNicknameMember);
  }, [channelDetail.members]);

  const updateNicknamesMutation = useMutation({
    mutationFn: (data: ChannelNicknamesBody) => channelApi.updateNicknames(channelDetail.id, data),
  });

  const handleOpenSettings = () => {
    console.log("Open channel settings modal");
  };

  const handleSaveNicknames = async (updates: ChannelNicknameUpdate[]) => {
    await updateNicknamesMutation.mutateAsync({ nicknames: updates });
  };

  // const resolveDisplayName = (userId: string, fallback: string) => nicknames[userId] ?? fallback;

  const handleThemeChange = (backgroundUrl: string, backgroundColor: string, accent: string) => {
    // updateSettingsMutation.mutate({ backgroundUrl, backgroundColor, accent });
  };

  const configChannel = useMemo(
    () => ({
      backgroundUrl: backgroundUrlChannel,
      backgroundColor: backgroundColorChannel,
      accent: accentChannel,
    }),
    [backgroundUrlChannel, backgroundColorChannel, accentChannel],
  );

  const nickNamesChannel = useMemo(() => {
    return nickNames.map((nickname) => ({
      userId: nickname.userId,
      avatar: nickname.user.avatar,
      fullName: nickname.user.fullName,
      nickname: nickname.nickname,
    }));
  }, [nickNames]);

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

      <CollapsibleSection title="Tuỳ chỉnh đoạn chat">
        <ChangeBackgroundChannel onSave={handleThemeChange} configChannel={configChannel} />

        {nickNamesChannel.length > 0 && (
          <SettingNickName members={nickNamesChannel} onSave={handleSaveNicknames} />
        )}
      </CollapsibleSection>
      <div className={styles.scrollableContent}>
        <div className={styles.customizationSection}></div>

        {/* <div className={styles.memberGroupSection}>
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
                    <span className={styles.displayName}>
                      {resolveDisplayName(member.id, member.displayName)}
                    </span>
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
                    <span className={styles.displayName}>
                      {resolveDisplayName(member.id, member.displayName)}
                    </span>
                    {member.isBot && <span className={styles.botBadge}>APP</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div> */}
      </div>
    </aside>
  );
}
