import { ICE_SERVERS } from "../utils/config";

class WebRTCService {
  pc: RTCPeerConnection | null = null;

  createPeer(onIce: (c: RTCIceCandidate) => void, onTrack: (s: MediaStream) => void) {
    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    this.pc.onicecandidate = (e) => e.candidate && onIce(e.candidate);
    this.pc.ontrack = (e) => onTrack(e.streams[0]);
    return this.pc;
  }

  addLocalTracks(stream: MediaStream) {
    stream.getTracks().forEach((t) => this.pc?.addTrack(t, stream));
  }

  async createOffer(): Promise<RTCSessionDescription> {
    const offer = await this.pc!.createOffer();
    await this.pc!.setLocalDescription(offer);
    return new RTCSessionDescription(offer);
  }

  async createAnswer(): Promise<RTCSessionDescription> {
    const answer = await this.pc!.createAnswer();
    await this.pc!.setLocalDescription(answer);
    return new RTCSessionDescription(answer);
  }

  async setRemote(sdp: RTCSessionDescriptionInit) {
    await this.pc?.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  async addIce(candidate: RTCIceCandidateInit) {
    await this.pc?.addIceCandidate(new RTCIceCandidate(candidate));
  }

  close() {
    this.pc?.close();
    this.pc = null;
  }
}

export const webRTCService = new WebRTCService();

/**
 * Trước tiên: WebRTC là gì?
Hãy hình dung như thế này:

2 browser muốn nói chuyện trực tiếp (P2P), gửi audio/video cho nhau.
Nhưng browser của bạn nằm sau router/NAT (không có IP public). Làm sao browser kia gửi gói tin đến bạn?
WebRTC = "Quy trình đàm phán + đóng gói media":
Hai bên tạo "đường ống" gọi là RTCPeerConnection.
Hai bên trao đổi SDP (offer/answer) để nói: "Tôi support codec này, tôi muốn gửi audio+video".
Hai bên trao đổi ICE candidate — mỗi candidate là 1 đường mạng khả dĩ (IP:port). Khi 2 bên đã có chung candidate, browser tự chọn đường tốt nhất (cùng mạng LAN → STUN → TURN).
Sau khi có đường → media chảy qua đó.
File này là wrapper để gọi WebRTC API cho gọn, đỡ phải nhớ cú pháp.
 */