import { useState } from "react";
import { Button, Space, Tooltip } from "antd";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { mediaService } from "../../services/MediaService";
import { useCallStore } from "../../store/callStore";
import styles from "./CallToolbar.module.scss";

interface Props {
  onEnd: () => void;
}

export const CallToolbar = ({ onEnd }: Props) => {
  const localStream = useCallStore((s) => s.localStream);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const toggleMic = () => {
    const next = !micOn;
    mediaService.toggleMic(localStream, next);
    setMicOn(next);
  };

  const toggleCam = () => {
    const next = !camOn;
    mediaService.toggleCamera(localStream, next);
    setCamOn(next);
  };

  return (
    <div className={styles.toolbar}>
      <Space size="middle">
        <Tooltip title={micOn ? "Tắt mic" : "Bật mic"}>
          <Button
            shape="circle"
            size="large"
            onClick={toggleMic}
            icon={micOn ? <Mic size={20} /> : <MicOff size={20} />}
            danger={!micOn}
          />
        </Tooltip>
        <Tooltip title={camOn ? "Tắt camera" : "Bật camera"}>
          <Button
            shape="circle"
            size="large"
            onClick={toggleCam}
            icon={camOn ? <Video size={20} /> : <VideoOff size={20} />}
            danger={!camOn}
          />
        </Tooltip>
        <Tooltip title="Kết thúc">
          <Button
            shape="circle"
            size="large"
            danger
            type="primary"
            onClick={onEnd}
            icon={<PhoneOff size={20} />}
          />
        </Tooltip>
      </Space>
    </div>
  );
};