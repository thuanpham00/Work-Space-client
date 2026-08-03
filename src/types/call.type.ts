export type CallUser = { id: string; name: string; avatar?: string };

export type CallPayload = {
  conversationId: string;
  caller: CallUser;
  receiver: CallUser;
  isVideo: boolean;
};

export type SDPPayload = CallPayload & { sdp: RTCSessionDescriptionInit };
export type IcePayload = CallPayload & { candidate: RTCIceCandidateInit };

export type CallState = "IDLE" | "CALLING" | "RINGING" | "CONNECTING" | "CONNECTED" | "ENDED";
