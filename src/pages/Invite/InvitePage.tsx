import { useMutation, useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { App, Button } from "antd";
import { Check, Hash, UserPlus, X } from "lucide-react";
import { channelInviteApi } from "../../apis/channelInvite.api";
import AvatarFallback from "../../components/AvatarFallback/AvatarFallback";
import styles from "./InvitePage.module.scss";
import { channelApi } from "../../apis/channel.api";
import Loading from "../../components/Loading/Loading";
import { WorkspaceMemberStatus } from "../../types/workspace.type";

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
  });

  const dataChannel = dataInvite?.data.data.channel;
  const channelName = dataChannel?.name ?? "Kênh";
  const description = dataChannel?.description ?? "";
  const channelType = dataChannel?.type ?? "";

  const requestWorkspaceMutation = useMutation({
    mutationFn: (id: string) => channelApi.requestToJoin(id),
  });

  const cancelRequestMutation = useMutation({
    mutationFn: (id: string) => channelApi.cancelRequestToJoin(id),
  });

  const acceptInviteMutation = useMutation({
    mutationFn: (id: string) => channelApi.acceptInvite(id),
  });

  const rejectInviteMutation = useMutation({
    mutationFn: (id: string) => channelApi.rejectInvite(id),
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

  const handleAcceptInvite = async () => {
    if (!dataChannel) return;
    try {
      await acceptInviteMutation.mutateAsync(dataChannel.id);
      message.success("Chấp nhận lời mời thành công");
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRejectInvite = async () => {
    if (!dataChannel) return;
    try {
      await rejectInviteMutation.mutateAsync(dataChannel.id);
      message.success("Đã từ chối lời mời");
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  if (isFetching) return <Loading tip="Đang tải..." size="default" />;

  const renderAction = () => {
    switch (dataChannel?.channelStatus) {
      case WorkspaceMemberStatus.PENDING_INVITE:
        return (
          <div className={styles.friendActionsRow}>
            <Button
              type="primary"
              className={styles.inviteActionBtn}
              loading={acceptInviteMutation.isLoading}
              onClick={handleAcceptInvite}
            >
              Chấp nhận lời mời
            </Button>
            <Button
              danger
              type="default"
              className={styles.inviteActionBtn}
              loading={rejectInviteMutation.isLoading}
              onClick={handleRejectInvite}
            >
              Từ chối lời mời
            </Button>
          </div>
        );

      case WorkspaceMemberStatus.PENDING_REQUEST:
        return (
          <Button
            type="primary"
            icon={<X size={16} />}
            className={styles.inviteJoinBtn}
            loading={cancelRequestMutation.isLoading}
            onClick={handleCancelRequest}
          >
            Hủy yêu cầu
          </Button>
        );

      case WorkspaceMemberStatus.ACTIVE:
        return (
          <div className={styles.friendActionsRow}>
            <Button disabled icon={<Check size={16} />} className={styles.inviteJoinBtn}>
              Đã tham gia
            </Button>
          </div>
        );

      case WorkspaceMemberStatus.LEFT:
      case WorkspaceMemberStatus.CANCELED:
      case null: 
        return (
          <Button
            type="primary"
            icon={<UserPlus size={16} />}
            className={styles.inviteJoinBtn}
            loading={requestWorkspaceMutation.isLoading}
            onClick={handleRequestInvite}
          >
            Tham gia
          </Button>
        );

      case WorkspaceMemberStatus.BANNED:
        return (
          <Button disabled className={styles.inviteJoinBtn}>
            Bạn đã bị cấm khỏi kênh này
          </Button>
        );

      default:
        return null;
    }
  };

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

        {renderAction()}
      </div>
    </div>
  );
}
