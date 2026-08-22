import { useMemo } from "react";
import { App } from "antd";
import type {
  ChannelDM,
  ChannelMemberNickname,
  ChannelNicknameUpdate,
  ChannelNicknamesBody,
  ChannelSettingsBody,
} from "../../../../../types/channel.type";
import CollapsibleSection from "../../../../../components/CollapsibleSection/CollapsibleSection";
import ChangeBackgroundChannel from "../../../../../components/ChangeBackgroundChannel/ChangeBackgroundChannel";
import SettingNickName from "../../../../../components/SettingNickName/SettingNickName";
import { useMutation } from "react-query";
import { channelApi } from "../../../../../apis/channel.api";

interface CustomizationSectionProps {
  channelDMDetail: ChannelDM;
  onNicknamesSaved?: (nicknames: Record<string, string>) => void;
  backgroundUrlDM: string;
  backgroundColorDM: string;
  accentDM: string;
  nickNames: ChannelMemberNickname[];
}

export type MemeberNickname = {
  userId: string;
  avatar: string;
  fullName: string;
  nickname: string;
};

const CustomizationSection = ({
  channelDMDetail,
  backgroundUrlDM,
  backgroundColorDM,
  accentDM,
  nickNames,
}: CustomizationSectionProps) => {
  const { message } = App.useApp();

  const configChannel = useMemo(
    () => ({ backgroundUrl: backgroundUrlDM, backgroundColor: backgroundColorDM, accent: accentDM }),
    [backgroundUrlDM, backgroundColorDM, accentDM],
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

  const handleThemeChange = (backgroundUrl: string, backgroundColor: string, accent: string) => {
    updateSettingsMutation.mutate({ backgroundUrl, backgroundColor, accent });
  };

  const handleSaveNicknames = (updates: ChannelNicknameUpdate[]) => {
    console.log(updates);
    const payload = updates.map((update) => ({
      userId: update.userId,
      nickname: update.nickname,
    }));
    updateNicknamesMutation.mutate({ nicknames: payload });
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

export default CustomizationSection;
