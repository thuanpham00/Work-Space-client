import { useEffect } from "react";
import { socketService } from "../services/SocketServices";
import { callService } from "../services/CallService";
import { webRTCService } from "../services/WebRTCService";
import { useCallStore } from "../store/callStore";

export const useCall = () => {
  const state = useCallStore((s) => s.state);

  useEffect(() => {
    socketService.on("incoming-call", (p) => callService.setIncoming(p));

    socketService.on("call:accepted", async (p) => {
      // Caller: tạo peer + offer
      const { setState, setLocalStream } = useCallStore.getState();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: p.isVideo,
        audio: true,
      });
      setLocalStream(stream);
      setState("CONNECTING");

      webRTCService.createPeer(
        (c) => socketService.emit("call:ice", { ...p, candidate: c.toJSON() }),
        (s) => useCallStore.getState().setRemoteStream(s),
      );
      webRTCService.addLocalTracks(stream);
      const offer = await webRTCService.createOffer();
      socketService.emit("call:offer", { ...p, sdp: offer.toJSON() });
    });

    socketService.on("call:offer", (p) => callService.handleOffer(p.sdp, p));
    socketService.on("call:answer", (p) => callService.handleAnswer(p.sdp));
    socketService.on("call:ice", (p) => callService.handleIce(p.candidate));
    socketService.on("call:rejected", () => useCallStore.getState().reset());
    socketService.on("call:ended", () => useCallStore.getState().reset());

    return () => {
      socketService.off("incoming-call");
      socketService.off("call:accepted");
      socketService.off("call:offer");
      socketService.off("call:answer");
      socketService.off("call:ice");
      socketService.off("call:rejected");
      socketService.off("call:ended");
    };
  }, []);

  return {
    state,
    startCall: callService.startCall.bind(callService),
    acceptCall: callService.acceptCall.bind(callService),
    rejectCall: callService.rejectCall.bind(callService),
    endCall: callService.endCall.bind(callService),
  };
};
