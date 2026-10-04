import { useMutation, useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { App, Button, Spin } from "antd";
import { Hash } from "lucide-react";
import { channelInviteApi } from "../../apis/channelInvite.api";
import AvatarFallback from "../../components/AvatarFallback/AvatarFallback";
import styles from "./InvitePage.module.scss";
import { channelApi } from "../../apis/channel.api";
import Loading from "../../components/Loading/Loading";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const { message } = App.useApp();

  const {
    data: dataInvite,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["invite", token],
    queryFn: () => channelInviteApi.getInvite(token ?? ""),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

  const dataChannel = dataInvite?.data.data;
  const channelName = dataChannel?.name ?? "Kênh";
  const description = dataChannel?.description ?? "";
  const channelType = dataChannel?.type ?? "";

  const requestWorkspaceMutation = useMutation({
    mutationFn: (id: string) => channelApi.requestToJoin(id),
  });

  const cancelRequestMutation = useMutation({
    mutationFn: (id: string) => channelApi.cancelRequestToJoin(id),
  });

  const handleRequestInvite = async () => {
    if (!dataChannel) return;
    try {
      await requestWorkspaceMutation.mutateAsync(dataChannel.id);
      message.success("Yêu cầu tham gia channel đã được gửi");
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelRequest = async () => {
    if (!dataChannel) return;
    try {
      await cancelRequestMutation.mutateAsync(dataChannel.id);
      message.success("Đã hủy yêu cầu tham gia channel");
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  const handleJoin = () => {
    console.log("Join channel with token:", token);
  };

  if (isFetching) return <Loading tip="Đang tải..." size="default" />;

  return (
    <div className={styles.invitePage}>
      <div className={styles.inviteCard}>
        <div className={styles.inviteHeader}>
          <AvatarFallback
            src={null}
            alt={channelName}
            size={72}
            showStatus={false}
            className={styles.inviteAvatar}
          />
          <h1 className={styles.inviteTitle}>{channelName}</h1>
        </div>

        {description ? <p className={styles.inviteDescription}>{description}</p> : null}

        {channelType ? (
          <div className={styles.inviteMeta}>
            <Hash size={12} />
            <span>{channelType}</span>
          </div>
        ) : null}

        <div className={styles.inviteToken}>
          Mã mời: <strong>{token}</strong>
        </div>

        <Button type="primary" className={styles.inviteJoinBtn} onClick={handleJoin}>
          Tham gia kênh
        </Button>
      </div>
    </div>
  );
}
