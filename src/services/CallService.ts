import { mediaService } from "./MediaService";
import { webRTCService } from "./WebRTCService";
import type { CallPayload, SDPPayload, IcePayload } from "../types/call.type";
import { useCallStore } from "../store/callStore";
import { socketService } from "./SocketServices";

class CallService {
  private pendingPayload: CallPayload | null = null;

  async startCall(payload: CallPayload) {
    const store = useCallStore.getState();
    store.setCall(payload);
    store.setState("CALLING");

    const stream = await mediaService.startCamera(payload.isVideo);
    store.setLocalStream(stream);
    socketService.emit("call:start", payload);
  }

  setIncoming(payload: CallPayload) {
    const store = useCallStore.getState();
    this.pendingPayload = payload;
    store.setCall(payload);
    store.setState("RINGING");
  }

  async acceptCall() {
    if (!this.pendingPayload) return;
    const payload = this.pendingPayload;
    const store = useCallStore.getState();

    store.setState("CONNECTING");
    const stream = await mediaService.startCamera(payload.isVideo);
    store.setLocalStream(stream);

    webRTCService.createPeer(
      (c) => socketService.emit("call:ice", { ...payload, candidate: c.toJSON() } as IcePayload),
      (s) => store.setRemoteStream(s),
    );
    webRTCService.addLocalTracks(stream);

    socketService.emit("call:accept", payload);
  }

  async handleOffer(sdp: RTCSessionDescriptionInit, payload: SDPPayload) {
    if (!webRTCService.pc) return;
    await webRTCService.setRemote(sdp);
    const answer = await webRTCService.createAnswer();
    socketService.emit("call:answer", { ...payload, sdp: answer.toJSON() });
  }

  async handleAnswer(sdp: RTCSessionDescriptionInit) {
    await webRTCService.setRemote(sdp);
    useCallStore.getState().setState("CONNECTED");
  }

  async handleIce(candidate: RTCIceCandidateInit) {
    await webRTCService.addIce(candidate);
  }

  rejectCall() {
    if (!this.pendingPayload) return;
    socketService.emit("call:reject", this.pendingPayload);
    this.cleanup();
  }

  endCall() {
    const { callPayload } = useCallStore.getState();
    if (callPayload) {
      socketService.emit("call:end", callPayload);
    }
    this.cleanup();
  }

  private cleanup() {
    const store = useCallStore.getState();
    mediaService.stopAll(store.localStream);
    webRTCService.close();
    store.reset();
    this.pendingPayload = null;
  }
}

export const callService = new CallService();
