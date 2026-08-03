import { Modal, Button, Space } from "antd";
import { Phone, PhoneOff, Check } from "lucide-react";
import { useCall } from "../../Hooks/useCall";
import { useCallStore } from "../../store/callStore";
import { LocalVideo } from "./LocalVideo";
import { RemoteVideo } from "./RemoteVideo";
import { CallToolbar } from "./CallToolbar";
import styles from "./CallModal.module.scss";

export const CallModal = () => {
  const { state, acceptCall, rejectCall, endCall } = useCall();
  const { callPayload, localStream, remoteStream } = useCallStore();

  const open = state !== "IDLE" && state !== "ENDED";
  if (!open || !callPayload) return null;

  const isSmall = state === "CALLING" || state === "RINGING";

  return (
    <Modal
      open={open}
      footer={null}
      closable={false}
      width={isSmall ? 400 : 720}
      destroyOnClose={false}
      maskClosable={false}
      centered
    >
      {state === "CALLING" && (
        <div className={styles.center}>
          <Avatar name={callPayload.receiver.name} avatar={callPayload.receiver.avatar} />
          <h3>Đang gọi {callPayload.receiver.name}...</h3>
          <p className={styles.subtitle}>Đang chờ người nhận chấp nhận</p>
          <Button danger type="primary" icon={<PhoneOff size={18} />} onClick={endCall}>
            Huỷ
          </Button>
        </div>
      )}

      {state === "RINGING" && (
        <div className={styles.center}>
          <Avatar name={callPayload.caller.name} avatar={callPayload.caller.avatar} ringing />
          <h3>{callPayload.caller.name} đang gọi bạn</h3>
          <p className={styles.subtitle}>
            Cuộc gọi {callPayload.isVideo ? "video" : "thoại"}
          </p>
          <Space>
            <Button danger icon={<PhoneOff size={18} />} onClick={rejectCall}>
              Từ chối
            </Button>
            <Button
              type="primary"
              icon={<Check size={18} />}
              onClick={acceptCall}
              style={{ background: "#52c41a", borderColor: "#52c41a" }}
            >
              Chấp nhận
            </Button>
          </Space>
        </div>
      )}

      {(state === "CONNECTING" || state === "CONNECTED") && (
        <div className={styles.callBox}>
          <div className={styles.remote}>
            <RemoteVideo stream={remoteStream} />
            {state === "CONNECTING" && <div className={styles.connectingBadge}>Đang kết nối...</div>}
          </div>
          <div className={styles.local}>
            <LocalVideo stream={localStream} />
          </div>
          <CallToolbar onEnd={endCall} />
        </div>
      )}
    </Modal>
  );
};

const Avatar = ({ name, avatar, ringing }: { name: string; avatar?: string; ringing?: boolean }) => {
  const initial = name?.[0]?.toUpperCase() ?? "?";
  return (
    <div className={`${styles.avatar} ${ringing ? styles.ringing : ""}`}>
      {avatar ? <img src={avatar} alt={name} /> : <span>{initial}</span>}
      <Phone size={20} className={styles.avatarIcon} />
    </div>
  );
};