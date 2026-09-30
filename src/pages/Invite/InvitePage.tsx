import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { Button } from "antd";
import { Hash } from "lucide-react";
import { channelInviteApi } from "../../apis/channelInvite.api";
import AvatarFallback from "../../components/AvatarFallback/AvatarFallback";
import styles from "./InvitePage.module.scss";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();

  const { data: dataInvite } = useQuery({
    queryKey: ["invite", token],
    queryFn: () => channelInviteApi.getInvite(token ?? ""),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

  if (!token) return null;

  const dataChannel = dataInvite?.data.data;
  const channelName = dataChannel?.name ?? "Kênh";
  const description = dataChannel?.description ?? "";
  const channelType = dataChannel?.type ?? "";

  const handleJoin = () => {
    console.log("Join channel with token:", token);
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

        <Button type="primary" className={styles.inviteJoinBtn} onClick={handleJoin}>
          Tham gia kênh
        </Button>
      </div>
    </div>
  );
}
