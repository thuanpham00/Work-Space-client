import { useEffect, useRef } from "react";

interface Props {
  stream: MediaStream | null;
}

export const LocalVideo = ({ stream }: Props) => {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (ref.current && stream) ref.current.srcObject = stream;
  }, [stream]);

  return <video ref={ref} autoPlay muted playsInline className="local-video" />;
};