import { useEffect, useRef } from "react";

interface Props {
  stream: MediaStream | null;
}

export const RemoteVideo = ({ stream }: Props) => {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (ref.current && stream) ref.current.srcObject = stream;
  }, [stream]);

  return <video ref={ref} autoPlay playsInline className="remote-video" />;
};