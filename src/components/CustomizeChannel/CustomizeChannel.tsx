import { useMemo } from "react";
import { App } from "antd";
import type {
  Channel,
  ChannelDM,
  ChannelMemberNickname,
  ChannelNicknamesBody,
  ChannelNicknameUpdate,
  ChannelSettingsBody,
} from "../../types/channel.type";
import { useMutation } from "react-query";
import { channelApi } from "../../apis/channel.api";
import CollapsibleSection from "../CollapsibleSection/CollapsibleSection";
import ChangeBackgroundChannel from "../ChangeBackgroundChannel/ChangeBackgroundChannel";
import SettingNickName from "../SettingNickName/SettingNickName";

interface CustomizationSectionProps {
  channelDMDetail: ChannelDM | Channel;
  backgroundUrlDM: string;
  accentDM: string;
  nickNames: ChannelMemberNickname[];
}

export type MemberNickname = {
  userId: string;
  avatar: string;
  fullName: string;
  nickname: string;
};

const CustomizeChannel = ({
  channelDMDetail,
  backgroundUrlDM,
  accentDM,
  nickNames,
}: CustomizationSectionProps) => {
  const { message } = App.useApp();

  const configChannel = useMemo(
    () => ({ backgroundUrl: backgroundUrlDM, accent: accentDM }),
    [backgroundUrlDM, accentDM],
  );

  const nickNamesChannel = useMemo(() => {
    return nickNames.map((nickname) => ({
      userId: nickname.userId,
      avatar: nickname.user.avatar,
      fullName: nickname.user.fullName,
      nickname: nickname.nickname,
    }));
  }, [nickNames]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data: ChannelSettingsBody) => channelApi.updateSettings(channelDMDetail.id, data),
    onSuccess: () => {
      message.success("Đã cập nhật tuỳ chỉnh đoạn chat");
    },
  });

  const updateNicknamesMutation = useMutation({
    mutationFn: (data: ChannelNicknamesBody) => channelApi.updateNicknames(channelDMDetail.id, data),
    onSuccess: () => {
      message.success("Đã cập nhật tuỳ chỉnh đoạn chat");
    },
  });

  const handleThemeChange = (backgroundUrl: string, accent: string) => {
    updateSettingsMutation.mutate({ backgroundUrl, accent });
  };

  const handleSaveNicknames = (updates: ChannelNicknameUpdate) => {
    updateNicknamesMutation.mutate({ nickname: updates });
  };

  return (
    <CollapsibleSection title="Tuỳ chỉnh đoạn chat">
      <ChangeBackgroundChannel onSave={handleThemeChange} configChannel={configChannel} />

      {nickNamesChannel.length > 0 && (
        <SettingNickName members={nickNamesChannel} onSave={handleSaveNicknames} />
      )}
    </CollapsibleSection>
  );
};

export default CustomizeChannel;
